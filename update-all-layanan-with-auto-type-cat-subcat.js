console.log(`
/**********************************************
 *                                            *
 *        Created By: AMR CODE               *
 *        Modified By: UNICODE               *
 *        Visit: https://fb.com/amir.ofc01   *
 *        Tools Gratis, Tidak Dijual Belikan *
 *                                            *
 **********************************************/
`)

var globalSettings = {},
  savedUpdates = {},
  isProcessing = true

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitForSellerDialog(action = 'show', timeout = 60000) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const dialogs = document.querySelectorAll('.el-dialog__wrapper')
      const sellerDialog = dialogs[0]
      if (sellerDialog) {
        const display = sellerDialog.style.display
        if (action === 'show' && display !== 'none') {
          clearInterval(interval)
          clearTimeout(timer)
          resolve(sellerDialog)
        } else if (action === 'hide' && display === 'none') {
          clearInterval(interval)
          clearTimeout(timer)
          resolve(sellerDialog)
        }
      }
    }, 100)
    const timer = setTimeout(() => {
      clearInterval(interval)
      resolve(console.log('Timeout waiting for seller dialog.'))
    }, timeout)
  })
}

async function waitForSaveDialog(action = 'show', timeout = 60000) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const dialogs = document.querySelectorAll('.el-dialog__wrapper')
      const saveDialog = dialogs[2]
      if (saveDialog) {
        const display = saveDialog.style.display
        if (action === 'show' && display !== 'none') {
          clearInterval(interval)
          clearTimeout(timer)
          resolve(saveDialog)
        } else if (action === 'hide' && display === 'none') {
          clearInterval(interval)
          clearTimeout(timer)
          resolve(saveDialog)
        }
      }
    }, 100)
    const timer = setTimeout(() => {
      clearInterval(interval)
      resolve(console.log('Timeout waiting for save dialog.'))
    }, timeout)
  })
}

function getTimestamp() {
  const now = new Date()
  const options = {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }
  const formatter = new Intl.DateTimeFormat('id-ID', options)
  const formatted = formatter.format(now)
  const [date, time] = formatted.split(' ')
  return date.replace(/\//g, '-') + '_' + time.replace(/:/g, '')
}

function downloadTextFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.style.display = 'none'
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function createCode(title, index) {
  const [part1, part2, part3, part4] = title.split('|');
  
  // Function to extract meaningful parts from each segment
  const extractCodeParts = (text) => {
    if (!text) return '';
    
    // Clean the text
    let cleaned = text.replace(/[^a-zA-Z0-9 ]/g, '')
                     .replace(/\b(and|atau|dengan|untuk|the|of)\b/gi, '')
                     .trim();
    
    // Split into words and take first letters or first 2-3 letters of each word
    const words = cleaned.split(/\s+/).filter(w => w.length > 0);
    
    if (words.length === 0) return '';
    
    // For short names (1-2 words), take first 3 letters of each word
    if (words.length <= 2) {
      return words.map(w => w.substring(0, 3)).join('');
    }
    
    // For longer names, take first letters and numbers
    let code = '';
    for (const word of words) {
      // If word contains numbers, include them
      if (/\d/.test(word)) {
        code += word.match(/\d+/)[0];
      } else {
        code += word[0].toUpperCase();
      }
      
      // Limit code length
      if (code.length >= 4) break;
    }
    
    return code;
  };

  // Extract parts from each segment
  const codeParts = [
    extractCodeParts(part1),
    extractCodeParts(part2),
    extractCodeParts(part3),
    extractCodeParts(part4)
  ].filter(part => part.length > 0);

  // Combine parts and add index
  let base = codeParts.join('').toUpperCase();
  
  // If we have numbers in the base, we might not need the index
  if (/\d/.test(base)) {
    return base.length > 20 ? base.substring(0, 20) : base;
  }
  
  // Otherwise add index
  let fullCode = `${base}${index}`;
  
  // Ensure code isn't too long
  return fullCode.length > 25 ? fullCode.substring(0, 25) : fullCode;
}

async function selectSeller(minRating = false, multiService = false, withInvoice = false) {
  let sortHeader = document.querySelector(
    '.el-dialog__wrapper .el-table__header-wrapper thead tr th.el-table_2_column_16'
  )
  if (!sortHeader.classList.contains('ascending')) {
    sortHeader.querySelector('i.sort-caret.ascending').click()
    await delay(1000)
  }
  const dialogs = document.querySelectorAll('.el-dialog__wrapper')
  const sellerDialog = dialogs[0]
  const rows = sellerDialog.querySelectorAll('.el-table__body-wrapper tbody tr')
  let selectedData = {}
  let isMatch = false
  try {
    for (let row of rows) {
      isMatch = true
      let serviceName = row.querySelector('.el-table_2_column_14 .el-row:nth-child(1)').innerText
      let rating = row.querySelector('.el-table_2_column_15').innerText
      let hasInvoice = row.querySelector('.el-table_2_column_19').innerText
      let isMulti = row.querySelector('.el-table_2_column_20').innerText
      let price = row.querySelector('.el-table_2_column_16').innerText

      try {
        rating = rating.match(/([0-9.]+) \(/)[1]
      } catch {
        rating = 0
      }
      isMulti = /Ya/i.test(isMulti)
      hasInvoice = /Ya/i.test(hasInvoice)

      let rawPrice = price
      price = price.match(/[0-9.]+/)[0].replace('.', '')

      if (minRating !== false && parseFloat(rating) < parseFloat(minRating)) {
        console.log(`${serviceName} Tidak cocok karna rating lebih rendah ${rating}`)
        isMatch = false
      }
      if (multiService && !isMulti) {
        console.log(`${serviceName} Tidak cocok karna layanan bukan multi`)
        isMatch = false
      }
      if (withInvoice ? !hasInvoice : hasInvoice) {
        console.log(`${serviceName} Tidak cocok karna layanan ${withInvoice ? 'tidak memiliki' : 'memiliki'} faktur pajak`)
        isMatch = false
      }
      if (isMatch) {
        row.querySelector('.el-table_2_column_24 button.el-button--mini:not(.is-plain)').click()
        console.log(`${serviceName} Cocok dengan rating ${rating} dan harga ${rawPrice}`)
        await waitForSellerDialog('hide')
        selectedData = {
          nama: serviceName,
          rating: rating,
          harga: rawPrice,
        }
        break
      }
    }
  } catch (error) {
    console.log('Ada Error exception, mungkin seller tidak tersedia', error)
  }

  if (!isMatch) {
    const currentPage = document.querySelector('.el-dialog__wrapper .el-pager li.number.active')
    const nextPage = currentPage ? currentPage.nextElementSibling : undefined
    if (nextPage) {
      nextPage.click()
      await delay(500)
      return await selectSeller(minRating, multiService, withInvoice)
    } else {
      console.log('Tidak ada yang cocok, select seller close')
      document.querySelector('.el-dialog__wrapper [aria-label="Pilih Seller"] .el-dialog__headerbtn').click()
      await waitForSellerDialog('hide')
      console.log('Tidak ada halaman berikutnya')
      return null
    }
  }
  await delay(500)
  return selectedData
}

async function processTable(category, subcategory, typeLabel) {
  let tables = document.querySelectorAll('.sc-table .el-table__body-wrapper')
  if (tables.length === 0) {
    console.log('Data tidak ditemukan')
    return false
  }
  tables = tables.length === 1 ? tables[0].querySelectorAll('.el-table__row') : tables[1].querySelectorAll('.el-table__row')
  let index = 1

  for (let row of tables) {
    if (!isProcessing) break

    const serviceName = row.querySelector('td.el-table_1_column_5').innerText
    const currentSeller = row.querySelector('td.el-table_1_column_7').innerText
    const currentPrice = row.querySelector('td.el-table_1_column_8').innerText
    let codeInput = row.querySelector('.el-table_1_column_3 input')
    const priceInput = row.querySelector('.el-table_1_column_4 input')

    let generatedCode = createCode(`${category}|${subcategory}|${typeLabel}|${serviceName}`, index)

    if (codeInput?.value?.length > 1 && globalSettings?.update_all === false) {
      console.log(`${serviceName} Diskipp karena tidak disetel untuk تحديث الكل`)
      continue
    }

    if (globalSettings?.replace_code === false && codeInput?.value?.length > 1) {
      generatedCode = codeInput.value
    }

    codeInput.value = generatedCode
    codeInput.dispatchEvent(new Event('input', { bubbles: true }))
    row.querySelector('.el-table_1_column_6 button').click()

    await waitForSellerDialog('show')
    const selected = await selectSeller(globalSettings?.rating)
    if (!selected) {
      console.log(`Gagal memilih seller untuk layanan ${serviceName}`)
      continue
    }

    if (!savedUpdates[category]) savedUpdates[category] = []
    savedUpdates[category].push({
      layanan: serviceName,
      old_seller: currentSeller,
      old_harga: currentPrice,
      new_seller: selected.nama,
      new_rating: selected.rating,
      new_harga: selected.harga,
    })

    if (globalSettings?.harga_max === true) {
      try {
        const cleanPrice = selected.harga.replace(/\D/g, '')
        priceInput.value = cleanPrice
        priceInput.dispatchEvent(new Event('input', { bubbles: true }))
      } catch (e) {
        console.log(e)
      }
    }

    const statusSwitch = row.querySelector('.el-table_1_column_11 .el-switch')
    if (!statusSwitch.classList.contains('is-checked')) {
      statusSwitch.querySelector('input').click()
    }

    index++
  }

  try {
    const currentPage = document.querySelector('.el-dialog__wrapper + div .el-pager .number.active')
    const nextPage = currentPage.nextElementSibling
    if (nextPage) {
      nextPage.click()
      await delay(500)
      await processTable(category, subcategory, typeLabel)
    } else {
      console.log('Tidak ada halaman berikutnya')
    }
  } catch {}
}

async function saveChanges() {
  try {
    document.querySelector('.el-button.el-button--primary.el-button--medium').click()
    await waitForSaveDialog('show', 10000)
    const dialogs = document.querySelectorAll('.el-dialog__wrapper')
    dialogs[2].querySelector('.el-button.el-button--primary').click()
    await waitForSaveDialog('hide', 10000)
  } catch {
    console.log('ERROR SAVE')
  }
}

async function processSubcategory(category, subcategory) {
  const buttons = Array.from(document.querySelectorAll('.el-tab-pane > span > button.el-button--info')).filter((btn) => {
    const parent = btn.closest('.el-tab-pane')
    return parent && window.getComputedStyle(parent).display !== 'none'
  })

  let count = 1
  for (let btn of buttons) {
    if (!isProcessing) break
    const type = btn.innerText
    if (count > 1) btn.click()
    await delay(500)
    await processTable(category, subcategory, type)
    await delay(500)
    if (globalSettings?.auto_save === true) {
      await saveChanges()
      await delay(1000)
    }
    count++
  }
}

async function processCategory(category = null) {
  const buttons = Array.from(document.querySelectorAll('.el-tab-pane > span > button.el-button--primary')).filter((btn) => {
    const parent = btn.closest('.el-tab-pane')
    return parent && window.getComputedStyle(parent).display !== 'none'
  })

  let count = 1
  for (let btn of buttons) {
    if (!isProcessing) break
    const subcategory = btn.innerText
    if (count > 1) btn.click()
    await delay(1000)
    await processSubcategory(category, subcategory)
    count++
  }
}

async function processTypes() {
  const types = document.querySelectorAll('#daftarProduk .el-tabs__nav .el-tabs__item')
  let count = 1
  for (let typeTab of types) {
    if (!isProcessing) break
    const currentActive = document.querySelector('#daftarProduk .el-tabs__nav .el-tabs__item.is-active').nextElementSibling
    if (count > 1) currentActive.click()
    await delay(1000)
    await processCategory(typeTab.innerText)
    count++
  }
  if (isProcessing) exportData()
}

async function initialize() {
  const updateAll = confirm('Klik Ok Untuk Update Semua layanan...')
  const replaceCode = updateAll ? confirm('Klik Ok Untuk Menimpa Code...') : true
  const hargaMax = confirm('Klik Ok untuk isi harga max...')
  const autoSave = confirm('Klik Ok untuk auto save...')
  let rating = prompt('Masukan Minimal Rating Seller:')
  rating = rating === '0' ? null : rating

  globalSettings = {
    update_all: updateAll,
    replace_code: replaceCode,
    auto_save: autoSave,
    rating: rating,
    harga_max: hargaMax,
  }

  const confirmRun = confirm(`Konfirmasi Settingan: Update Semua: (${updateAll}), Replace Code: (${replaceCode}), Harga Max: (${hargaMax}), Auto Save: (${autoSave}), Rating: (${rating})`)
  if (confirmRun) await processTypes()
  else console.log('Aksi Dibatalkan')
}

function exportData() {
  document.removeEventListener('keydown', spaceKeyHandler)
  alert('Proses stopped, Data update akan diunduh dalam 3 detik')
  isProcessing = false
  setTimeout(() => {
    let content = ''
    Object.entries(savedUpdates).forEach(([category, items]) => {
      content += `=======[${category}]=======\n`
      items.forEach((item) => {
        content += `Layanan: ${item.layanan}\n`
        content += `Old Seller: ${item.old_seller}\n`
        content += `Old Harga: ${item.old_harga}\n`
        if (item.new_seller) content += `New Seller: ${item.new_seller}\n`
        if (item.new_rating) content += `New Rating: ${item.new_rating}\n`
        if (item.new_harga) content += `New Harga: ${item.new_harga}\n\n`
      })
      content += `=======[END OF ${category}]=======\n`
    })
    const filename = 'update_digiflazz_' + getTimestamp() + '.txt'
    downloadTextFile(content, filename)
  }, 3000)
}

function spaceKeyHandler(event) {
  if (event.code === 'Space') exportData()
}

document.addEventListener('keydown', spaceKeyHandler)
initialize()
