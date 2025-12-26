// Quick Environment Test
// Add this temporarily to src/main.jsx to test if Vite loads env vars

console.log('═══════════════════════════════════════');
console.log('🧪 ENVIRONMENT VARIABLE TEST');
console.log('═══════════════════════════════════════');
console.log('');
console.log('1. import.meta.env object exists?', !!import.meta.env);
console.log('2. import.meta.env.DEV:', import.meta.env.DEV);
console.log('3. import.meta.env.MODE:', import.meta.env.MODE);
console.log('4. import.meta.env.BASE_URL:', import.meta.env.BASE_URL);
console.log('');
console.log('5. VITE_RECEIPT_PRESIGN_URL:');
console.log('   Value:', import.meta.env.VITE_RECEIPT_PRESIGN_URL);
console.log('   Type:', typeof import.meta.env.VITE_RECEIPT_PRESIGN_URL);
console.log('   Is undefined?', import.meta.env.VITE_RECEIPT_PRESIGN_URL === undefined);
console.log('');
console.log('6. All environment variables:');
console.log(import.meta.env);
console.log('');
console.log('7. All VITE_* variables:');
const viteVars = Object.keys(import.meta.env)
  .filter(key => key.startsWith('VITE_'))
  .reduce((obj, key) => {
    obj[key] = import.meta.env[key];
    return obj;
  }, {});
console.log(viteVars);
console.log('   Count:', Object.keys(viteVars).length);
console.log('');
console.log('═══════════════════════════════════════');
