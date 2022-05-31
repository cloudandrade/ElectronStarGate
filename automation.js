const { Builder, By, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
const moment = require('moment');
moment.locale('pt-br');
require('dotenv').config();

chrome.setDefaultService(
  new chrome.ServiceBuilder(chromedriver.path).build()
);

async function runRMPortalAutomation(
  entry1,
  entry2,
  entry3,
  entry4,
  manualEntry
) {
  let entry = manualEntry
    ? manualEntry
    : {
        um: entry1,
        dois: entry2,
        tres: entry3,
        quatro: entry4,
      };

  let driver = await new Builder().forBrowser('chrome').build();
  await driver.get(process.env.TARGET_URL);
  try {
    const originalWindow = await driver.getAllWindowHandles();
    const origin = await driver.getWindowHandle();

    //adquirindo o local do campo de usuario
    const userBar = await driver.findElement(
      By.xpath('//*[@id="txtUser"]')
    );

    //adquirindo o local do campo de senha
    const passwordBar = await driver.findElement(
      By.xpath('//*[@id="txtPass"]')
    );

    //adquirindo o local do campo de senha
    const loginButton = await driver.findElement(
      By.xpath('//*[@id="btnLogin"]')
    );

    //INSTRUÇÕES DA AUTOMAÇÃO

    //inserindo login e senha
    await userBar.sendKeys(process.env.USER);
    await passwordBar.sendKeys(process.env.PASS);
    //pressionando enter pra entrar
    await loginButton.sendKeys(Key.ENTER);
    //clicando no botão Espelho do cartão
    const buttonPointMirror = await driver.findElement(
      By.xpath(
        '//*[@id="ctl18_REC_PtoEspCartaoActionWeb_LinkControl"]'
      )
    );
    await buttonPointMirror.click();

    //obtendo a data inicial e final do mes atual
    const startDate = moment().startOf('month').format('DD/MM/YYYY');
    const endDate = moment().endOf('month').format('DD/MM/YYYY');

    //obtendo campos de preenchimento do calendario
    const startCalendar = await driver.findElement(
      By.xpath('//*[@id="ctl26_dpInicioPerMes_txtDate"]')
    );
    const endCalendar = await driver.findElement(
      By.xpath('//*[@id="ctl26_dpFimPerMes_txtDate"]')
    );
    //limpando e preenchendo os campos com as datas 01/mes e 30 ou 31/mes
    await startCalendar.click();
    await startCalendar.clear();
    await startCalendar.sendKeys(startDate.toString());

    await endCalendar.click();
    await endCalendar.clear();
    await endCalendar.sendKeys(endDate.toString());

    //obtendo botao de atualizar tabela
    const refreshTable = await driver.findElement(
      By.xpath('//*[@id="ctl26_btnAtualizar_tblabel"]')
    );
    //atualizando a busca da tabela
    await refreshTable.click();

    //obtendo menu de anexos e
    const menuAnexos = await driver.findElement(
      By.xpath('//*[@id="ctl26_ctl01_ctl01"]')
    );

    await menuAnexos.click();

    const inserirPonto = await driver.findElement(
      By.xpath(
        '//*[@id="ctl26_ctl01_ddlAnexosEspelho_DropDownMenuTable"]/tbody/tr/td/a[1]'
      )
    );

    //indo para a página de inserção de pontos
    await inserirPonto.click();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    let windowHandle = await driver.getAllWindowHandles();

    var day = moment().format('DD');

    windowHandle.forEach(async (w) => {
      if (originalWindow.toString() !== w.toString()) {
        driver.switchTo().window(w);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        //obtendo células do dia estimado
        const entrada1 = await driver.findElement(
          By.name(`GB$l${day - 1}$txtEnt1`)
        );
        const entrada2 = await driver.findElement(
          By.name(`GB$l${day - 1}$txtSai1`)
        );
        const entrada3 = await driver.findElement(
          By.name(`GB$l${day - 1}$txtEnt2`)
        );
        const entrada4 = await driver.findElement(
          By.name(`GB$l${day - 1}$txtSai2`)
        );
        const just = await driver.findElement(
          By.name(`GB$l${day - 1}$txtJust`)
        );

        //preenchendo os valores com as jornadas de trabalho
        if (entry.um !== null && entry.um !== undefined) {
          await entrada1.sendKeys(`${entry.um}`);
        } else if (entry.dois !== null && entry.dois !== undefined) {
          await entrada2.sendKeys(`${entry.dois}`);
        } else if (entry.tres !== null && entry.tres !== undefined) {
          await entrada3.sendKeys(`${entry.tres}`);
        } else if (
          entry.quatro !== null &&
          entry.quatro !== undefined
        ) {
          await entrada4.sendKeys(`${entry.quatro}`);
        }
        await just.sendKeys('Jornada de trabalho');

        await new Promise((resolve) => setTimeout(resolve, 3000));
        //salvando e saindo da aplicação
        if (process.env.ENVIRONMENT === 'prod') {
          const saveButton = await driver.findElement(
            By.xpath('//*[@id="GB_btnSalvar_tblabel"]')
          );
          await saveButton.click();
        }

        await driver.close();
        driver.switchTo().window(origin);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        await driver.close();
      }
    });
  } catch (error) {
    console.log('error: ', error);
  }
}

//runRMPortalAutomation('09:00', null, null, null, null);

module.exports = { runRMPortalAutomation };
