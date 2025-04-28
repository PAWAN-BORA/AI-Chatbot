import {exec} from "child_process";
const { DB_HOST, DB_USERNAME, DB_NAME, DB_PASSWORD } = process.env;
console.log(DB_HOST, DB_USERNAME, DB_NAME, DB_PASSWORD);
if (!DB_HOST || !DB_USERNAME || !DB_PASSWORD || !DB_NAME) {
  console.error('⚠️  Missing one of DB_HOST, DB_USERNAME, DB_PASSWORD or DB_NAME in your .env');
  process.exit(1);
}

const cmd = [
  'mysql',
  `-h ${DB_HOST}`,
  `-u ${DB_USERNAME}`,
  `-p${DB_PASSWORD}`,
  DB_NAME,
  '< migration/schema.sql'
].join(' ');

console.log('> running:', cmd);

exec(cmd, (err, _stdout, stderr) => {
  if (err) {
    console.error('❌ Migration failed:', stderr || err);
    process.exit(1);
  }
  console.log('✅ Migration complete');
  process.exit(0);
});
