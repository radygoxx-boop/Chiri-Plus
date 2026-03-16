/**
 * scripts/fetch-notion.js
 * Notion の「地理クイズ 問題バンク」DBから問題を取得し
 * api/questions.json として出力する。
 *
 * 必要な環境変数:
 *   NOTION_TOKEN  — Notion Integration の Internal Integration Token
 *   NOTION_DB_ID  — 問題バンクデータベースの ID（ハイフンなし32文字 or UUID）
 *
 * GitHub Actions の Secrets に設定すること。
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_DB_ID;

if (!TOKEN || !DB_ID) {
  console.warn('⚠️  NOTION_TOKEN / NOTION_DB_ID が未設定。空の questions.json を生成します。');
  fs.mkdirSync('api', { recursive: true });
  fs.writeFileSync('api/questions.json', JSON.stringify([], null, 2));
  process.exit(0);
}

// ── Notion API ヘルパー ──────────────────────────────
function notionRequest(endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.notion.com',
      path:     `/v1/${endpoint}`,
      method:   body ? 'POST' : 'GET',
      headers: {
        'Authorization':  `Bearer ${TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type':   'application/json',
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end',  () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ── テキスト取得ヘルパー ─────────────────────────────
function getText(prop) {
  if (!prop) return '';
  if (prop.type === 'title')     return prop.title.map(t => t.plain_text).join('');
  if (prop.type === 'rich_text') return prop.rich_text.map(t => t.plain_text).join('');
  if (prop.type === 'select')    return prop.select?.name || '';
  if (prop.type === 'number')    return prop.number ?? 0;
  if (prop.type === 'checkbox')  return prop.checkbox;
  return '';
}

// ── 難易度マッピング ─────────────────────────────────
const DIFF_MAP = { '基礎': 'easy', '標準': 'normal', '応用': 'hard' };

// ── メイン処理 ───────────────────────────────────────
async function main() {
  let allResults = [];
  let cursor = undefined;

  console.log('📥 Notion DB から問題を取得中...');

  // ページネーションで全件取得
  do {
    const body = {
      page_size: 100,
      filter: {
        property: '確認済み',
        checkbox:  { equals: true },   // 確認済み = true のもののみ
      },
    };
    if (cursor) body.start_cursor = cursor;

    const res = await notionRequest(`databases/${DB_ID}/query`, body);
    if (res.object === 'error') {
      console.error('❌ Notion API エラー:', res.message);
      process.exit(1);
    }
    allResults = allResults.concat(res.results || []);
    cursor = res.has_more ? res.next_cursor : undefined;
    console.log(`  取得済み: ${allResults.length} 件`);
  } while (cursor);

  // Notion ページ → Q配列フォーマットに変換
  const questions = allResults.map((page, idx) => {
    const p    = page.properties;
    const diff = DIFF_MAP[getText(p['難易度'])] || 'easy';
    const ans  = ['A','B','C','D'].indexOf(getText(p['正解']));
    return {
      id:   10000 + idx,           // ビルトイン問題と被らない ID 範囲
      code: getText(p['単元コード']),
      diff,
      cat:  getText(p['単元名']),
      q:    getText(p['問題文']),
      c:   [
        getText(p['選択肢A']),
        getText(p['選択肢B']),
        getText(p['選択肢C']),
        getText(p['選択肢D']),
      ],
      a:    ans >= 0 ? ans : 0,
      exp:  getText(p['解説']),
    };
  }).filter(q => q.q && q.c[0]);  // 問題文・選択肢Aが空のものは除外

  // 出力
  fs.mkdirSync('api', { recursive: true });
  fs.writeFileSync(
    path.join('api', 'questions.json'),
    JSON.stringify(questions, null, 2),
    'utf8'
  );
  console.log(`✅ api/questions.json に ${questions.length} 問を書き出しました。`);
}

main().catch(err => {
  console.error('❌ エラー:', err);
  // エラーでもデプロイは続行（空ファイルを生成）
  fs.mkdirSync('api', { recursive: true });
  fs.writeFileSync('api/questions.json', JSON.stringify([], null, 2));
});
