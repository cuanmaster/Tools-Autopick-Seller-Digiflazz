console.log(`
\t/**********************************************
\t *                                            *
\t *        Created By: AMR CODE               *
\t *        Decoded By: UNICODE               *
\t *        Visit: https://fb.com/amir.ofc01   *
\t *        Tools Gratis, Tidak Dijual Belikan *
\t *                                            *
\t **********************************************/
`);

function confirmDelete() {
    const deleteButton = document.querySelector('.el-message-box__btns .el-button.el-button--default.el-button--primary');
    if (deleteButton) deleteButton.click();
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function showAllButtons() {
    const infoButtons = document.querySelectorAll('.el-tab-pane > span > button.el-button.el-button--info');
    for (let button of infoButtons) {
        button.click();
        await wait(100);
    }
    console.log('Menampilkan layanan sebanyak', infoButtons.length);
}

async function deleteAllServices() {
    const deleteIcons = document.querySelectorAll('.el-tab-pane > span > button.el-button.el-button--info');
    for (let icon of deleteIcons) {
        confirmDelete();
        await wait(1000);
    }
    console.log('Menghapus layanan sebanyak', deleteIcons.length);
}

async function handlePostDelete() {
    await showAllButtons();
    console.log('BTN SELESAI DISHOW SEMUA');
    await deleteAllServices();
    console.log('BTN SELESAI DIHAPUS SEMUA');
}

async function handleChildButtons() {
    const primaryButtons = document.querySelectorAll('.el-tab-pane > span > button.el-button.el-button--primary');
    const visibleButtons = Array.from(primaryButtons).filter(btn => {
        const parent = btn.closest('.el-button.el-button--danger i.el-icon-delete');
        return parent && window.getComputedStyle(parent).display !== 'none';
    });

    for (let button of visibleButtons) {
        console.log(button);
        button.click();
        await wait(2000);
        await handlePostDelete();
    }
}

async function processAllButtons() {
    const infoButtons = document.querySelectorAll('.el-tab-pane > span > button.el-button.el-button--info');
    const visibleButtons = Array.from(infoButtons).filter(btn => {
        const parent = btn.closest('.el-button.el-button--danger i.el-icon-delete');
        return parent && window.getComputedStyle(parent).display !== 'none';
    });

    for (let button of visibleButtons) {
        await handleChildButtons();
        button.click();
        await wait(2000);
        await handleChildButtons();
    }
}

processAllButtons();
