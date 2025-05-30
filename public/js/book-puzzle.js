// 程序员的自我修养谜题交互逻辑

document.addEventListener('DOMContentLoaded', function () {
    const bookArea = document.getElementById('book-area');
    const cppBookArea = document.getElementById('cppbook-area');
    const bookTip = document.getElementById('book-tip');
    const bookDialog = document.getElementById('book-dialog');
    const bookDialogContent = document.getElementById('book-dialog-content');
    const bookDialogClose = document.getElementById('book-dialog-close');

    // 书本谜题内容
    const bookHtml = `
        <h2 style="text-align: center; margin-bottom: 18px;">程序员的自我修养</h2>
        <div style="font-size: 17px;">
        欢迎阅读《程序员的自我修养》！<br>
        1. 程序员最讨厌的数字是什么？<span style="color: #bca16b;">（提示：不是404）</span><br>
        2. 程序员最喜欢的饮料是什么？<span style="color: #bca16b;">（提示：与调试有关）</span><br>
        3. 程序员最常说的谎言是什么？<span style="color: #bca16b;">（提示：与完成时间有关）</span><br>
        </div>
    `;

    // C++编程思想书的提示内容
    const cppBookHtml = `
        <h2 style='text-align:center;margin-bottom:18px;'>C++编程思想</h2>
        <div style='font-size:17px;'>
        在C++的世界里，每个字符都有它的ASCII值。<br>
        比如字母按A=1, B=2, ..., Z=26，空格=0的方式转为数字。<br>
        例如：<span style='color:#bca16b;'>CODE</span> = 3+15+4+5 = 27<br>
        </div>
    `;

    const bookTipHtml = `
        <h2 style='text-align:center;margin-bottom:18px;'>世界的真相往往藏在相加之中！！</h2>
    `;
    bookArea.addEventListener('click', function () {
        bookDialogContent.innerHTML = bookHtml;
        bookDialog.style.display = 'flex';
    });
    cppBookArea.addEventListener('click', function () {
        bookDialogContent.innerHTML = cppBookHtml;
        bookDialog.style.display = 'flex';
    });
    bookTip.addEventListener('click', function () {
        bookDialogContent.innerHTML = bookTipHtml;
        bookDialog.style.display = 'flex';
    });
    bookDialogClose.addEventListener('click', function () {
        bookDialog.style.display = 'none';
    });
}); 