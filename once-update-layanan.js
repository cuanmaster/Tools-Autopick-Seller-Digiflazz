console.log(`
\t/**********************************************
\t *                                            *
\t *        Created By: AMR CODE               *
\t *        Modified By: Unicode               *
\t *        Visit: https://fb.com/amir.ofc01   *
\t *        Tools Gratis, Tidak Dijual Belikan *
\t *                                            *
\t **********************************************/
`);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForSellerTable(state = 'show', timeout = 60000) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const wrapper = document.querySelector('.el-dialog__wrapper');
      if (wrapper) {
        let display = wrapper.style.display;
        if ((state === 'show' && display !== 'none') || (state === 'hide' && display === 'none')) {
          clearInterval(interval);
          clearTimeout(timer);
          resolve(wrapper);
        }
      }
    }, 100);
    const timer = setTimeout(() => {
      clearInterval(interval);
      resolve(console.log('Timeout waiting for deteksiTableSeller: ' + state));
    }, timeout);
  });
}

async function waitForSaveModal(state = 'show', timeout = 60000) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const wrappers = document.querySelectorAll('.el-dialog__wrapper');
      const modal = wrappers[2];
      if (modal) {
        let display = modal.style.display;
        if ((state === 'show' && display !== 'none') || (state === 'hide' && display === 'none')) {
          clearInterval(interval);
          clearTimeout(timer);
          resolve(modal);
        }
      }
    }, 100);
    const timer = setTimeout(() => {
      clearInterval(interval);
      resolve(console.log('Timeout waiting for deteksiSaveModal: ' + state));
    }, timeout);
  });
}

function generateServiceCode(serviceName, number, maxCodeLength = 15) {
  // Bersihkan nama service dari karakter khusus dan ubah ke uppercase
  const cleanedName = serviceName.replace(/[^a-zA-Z0-9\s]/g, '').toUpperCase();
  
  // Pisahkan menjadi kata-kata dan ambil huruf dari setiap kata
  const words = cleanedName.split(/\s+/).filter(word => word.length > 0);
  let code = '';
  
  // Ambil lebih banyak huruf dari setiap kata (maksimal 3 huruf per kata)
  words.forEach(word => {
    code += word.substring(0, 3); // Ambil 3 huruf pertama dari setiap kata
  });
  
  // Tambahkan nomor dengan padding 2 digit
  const numericPart = number.toString().padStart(2, '0');
  code += numericPart;
  
  // Hanya ambil karakter alfanumerik dan batasi panjang maksimal
  const alphanumericCode = code.replace(/[^A-Z0-9]/g, '');
  return alphanumericCode.substring(0, maxCodeLength);
}

async function chooseSeller(minRating = 3.5, requireMulti = false, requireInvoice = false) {
  const sortColumn = document.querySelector('.el-dialog__wrapper .el-table__header-wrapper thead tr th.el-table_2_column_16');
  if (!sortColumn.classList.contains('ascending')) {
    sortColumn.querySelector('i.sort-caret.ascending').click();
    await wait(1000);
  }

  const sellerRows = document.querySelectorAll('.el-dialog__wrapper .el-table__body-wrapper tbody tr');
  let selectedSeller = {};
  let foundValid = false;

  for (const row of sellerRows) {
    foundValid = true;
    const sellerName = row.querySelector('.el-table_2_column_14 .el-row:nth-child(1)').innerText;
    let rating = row.querySelector('.el-table_2_column_15').innerText;
    const invoice = row.querySelector('.el-table_2_column_19').innerText.match(/Ya/i) ? true : false;
    const multiService = row.querySelector('.el-table_2_column_20').innerText.match(/Ya/i) ? true : false;
    const priceText = row.querySelector('.el-table_2_column_16').innerText;

    try {
      rating = parseFloat(rating.match(/([0-9.]+) \(/)[1]);
    } catch {
      rating = 0;
    }

    const priceClean = priceText.match(/[0-9.]+/)[0].replace('.', '');

    if (rating < minRating) {
      console.log(`${sellerName} Tidak cocok karena rating ${rating} lebih rendah dari minimum ${minRating}`);
      foundValid = false;
    }

    if (requireMulti && !multiService) {
      console.log(`${sellerName} Tidak cocok karena layanan bukan multi`);
      foundValid = false;
    }

    if (requireInvoice && !invoice) {
      console.log(`${sellerName} Tidak cocok karena layanan tidak memiliki faktur pajak`);
      foundValid = false;
    } else if (!requireInvoice && invoice) {
      console.log(`${sellerName} Tidak cocok karena layanan memiliki faktur pajak`);
      foundValid = false;
    }

    if (foundValid) {
      row.querySelector('.el-table_2_column_24 button.el-button--mini:not(.is-plain)').click();
      console.log(`${sellerName} Cocok dengan rating ${rating} dan harga ${priceText}`);
      await waitForSellerTable('hide');
      selectedSeller = { nama: sellerName, rating: rating, harga: priceText };
      break;
    }
  }

  if (!foundValid) {
    const currentPage = document.querySelector('.el-dialog__wrapper .el-pager li.number.active');
    const nextPage = currentPage?.nextElementSibling;
    if (nextPage) {
      nextPage.click();
      await wait(500);
      return await chooseSeller(minRating, requireMulti, requireInvoice);
    } else {
      console.log('Tidak ada seller yang cocok, menutup dialog pemilihan');
      document.querySelector('.el-dialog__wrapper [aria-label="Pilih Seller"] .el-dialog__headerbtn').click();
      await waitForSellerTable('hide');
      return null;
    }
  }

  await wait(500);
  return selectedSeller;
}

async function triggerSave() {
  try {
    const primaryBtn = document.querySelector('.el-button.el-button--primary.el-button--medium');
    primaryBtn.click();
    await waitForSaveModal('show', 10000);

    const modals = document.querySelectorAll('.el-dialog__wrapper');
    const modal = modals[2];
    const saveBtn = modal.querySelector('.el-button.el-button--primary');
    saveBtn.click();

    await waitForSaveModal('hide', 10000);
  } catch {
    console.log('ERROR SAVE');
  }
}

async function processAllServices(checkRating = true) {
  let tables = document.querySelectorAll('.sc-table .el-table__body-wrapper');
  if (tables.length === 0) {
    console.log('Data tidak ditemukan');
    return false;
  }

  let serviceRows = tables.length === 2
    ? tables[1].querySelectorAll('.el-table__row')
    : tables[0].querySelectorAll('.el-table__row');

  let no = 1;

  try {
    for (const row of serviceRows) {
      const serviceName = row.querySelector('td.el-table_1_column_5').innerText;
      const code = generateServiceCode(serviceName, no);
      const inputName = row.querySelector('.el-table_1_column_3 input');
      const inputPrice = row.querySelector('.el-table_1_column_4 input');

      if (inputName?.value?.length > 1) {
        inputName.value = inputName.value;
      } else {
        inputName.value = code;
      }

      inputName.dispatchEvent(new Event('input', { bubbles: true }));
      row.querySelector('.el-table_1_column_6 button').click();

      await waitForSellerTable('show');
      const selected = await chooseSeller(3.5); // Minimal rating 3.5

      if (!selected) {
        console.log('Gagal Memilih Seller untuk layanan ' + serviceName);
        continue;
      }

      console.log(serviceName, ' Result : ', selected);

      inputPrice.value = '0';
      inputPrice.dispatchEvent(new Event('input', { bubbles: true }));

      const switchToggle = row.querySelector('.el-table_1_column_11 .el-switch');
      if (!switchToggle.classList.contains('is-checked')) {
        switchToggle.querySelector('input').click();
        await wait(700);
      }

      no++;
      await wait(200);
    }
  } catch (err) {
    console.log('Ada Error exception, mungkin seller tidak tersedia', err);
  }

  await triggerSave();

  try {
    const activePage = document.querySelector('.el-dialog__wrapper + div .el-pager .number.active');
    const nextPage = activePage?.nextElementSibling;
    if (nextPage) {
      nextPage.click();
      await wait(500);
      processAllServices(checkRating);
    } else {
      console.log('Tidak ada yang cocok,select seller close');
      document.querySelector('.el-dialog__wrapper [aria-label="Pilih Seller"] .el-dialog__headerbtn').click();
      await waitForSellerTable('hide');
      console.log('Tidak ada halaman berikutnya');
    }
  } catch {}
}

processAllServices();
