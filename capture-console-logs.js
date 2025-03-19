const { exec } = require('child_process');
const puppeteer = require('puppeteer-core');

async function captureConsoleLogs() {
  // Encontrar a localização do chrome no sistema
  exec('which chromium-browser', async (error, stdout, stderr) => {
    if (error) {
      console.log('Erro ao encontrar o navegador:', error);
      return;
    }
    
    const chromePath = stdout.trim();
    console.log('Caminho do Chromium:', chromePath);
    
    try {
      // Iniciar o navegador com as opções corretas para rodar como root
      const browser = await puppeteer.launch({
        executablePath: chromePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: 'new'
      });
      
      const page = await browser.newPage();
      
      // Capturar logs do console
      page.on('console', message => {
        const type = message.type().substr(0, 3).toUpperCase();
        const text = message.text();
        console.log(`[${type}] ${text}`);
      });
      
      // Capturar erros da página
      page.on('pageerror', ({ message }) => {
        console.log('[ERROR] Erro na página:', message);
      });
      
      // Capturar falhas de requisição
      page.on('requestfailed', request => {
        console.log(`[FAIL] ${request.method()} ${request.url()} falhou: ${request.failure().errorText}`);
      });
      
      // Navegar para a aplicação
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle2' });
      
      // Aguardar um tempo para que os erros apareçam
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      await browser.close();
      console.log('Análise finalizada');
    } catch (err) {
      console.error('Erro durante a execução:', err);
    }
  });
}

captureConsoleLogs();
