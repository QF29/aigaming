// 会议室谜题交互逻辑（动态生成交互区）

document.addEventListener('DOMContentLoaded', function () {
    const scene = document.getElementById('meeting-scene');
    const dialog = document.getElementById('puzzle-dialog');
    const dialogContent = document.getElementById('puzzle-dialog-content');
    const dialogClose = document.getElementById('puzzle-dialog-close');

    // PRD谜题内容
    const prdHtml = `
        <div style="background:#fffbe8;padding:12px 18px;border-radius:6px;box-shadow:0 2px 8px #0002;">
                <span class="prd-annotation">这个需求很简单，怎么实现我不管，我只要能尽快上线</span>
                <span class="prd-strike">3</span>
                <span class="prd-strike">7</span>
                <span class="prd-strike">2</span>
                <span class="prd-strike">9</span>
                <span class="prd-strike">1</span>
            </div>
        </div>
    `;

    // 咖啡杯弹窗内容生成函数
    function getCoffeeHtml(cupIndex) {
        let dots = '';
        let label = '';
        if (cupIndex === 1) {
            dots = '<div class="coffee-dot"></div><div class="coffee-dot"></div>';
            
        } else if (cupIndex === 2) {
            dots = '<div class="coffee-dot"></div>';
           
        } else if (cupIndex === 3) {
            dots = '';
            
        } else if (cupIndex === 4) {
            dots = '<div class="coffee-dot"></div><div class="coffee-dot"></div><div class="coffee-dot"></div>';
           
        }
        return `
            <div style=\"background:#fffbe8;padding:12px 18px;border-radius:6px;box-shadow:0 2px 8px #0002;\">
                <div class=\"coffee-cup\"><div class=\"coffee-dots\">${dots}</div></div>
                <div class=\"coffee-label\">${label}</div>
            </div>
        `;
    }

    // 动态生成交互区
    fetch('../items.json')
        .then(res => {
            console.log('fetch items.json status:', res.status);
            return res.json();
        })
        .then(items => {
            console.log('items loaded:', items);
            // 只处理scene为meeting且puzzle为true的项
            const meetingPuzzles = items.filter(item => item.scene === 'meeting' && item.puzzle);
            console.log('meetingPuzzles:', meetingPuzzles);
            meetingPuzzles.forEach(item => {
                const area = document.createElement('div');
                area.className = 'interactive-area';
                area.style.left = item.x + 'px';
                area.style.top = item.y + 'px';
                area.style.width = item.width + 'px';
                area.style.height = item.height + 'px';
                area.setAttribute('data-type', item.type);
                area.setAttribute('title', item.type === 'prd' ? 'PRD文档' : '咖啡杯');
                area.addEventListener('click', function () {
                    console.log('clicked:', item.type, item.name);
                    if (item.type === 'prd') {
                        showDialog(prdHtml);
                    } else if (item.type === 'coffee') {
                        // 根据name判断是第几个咖啡杯
                        let cupIndex = 0;
                        if (item.name === 'meeting_coffee1') cupIndex = 1;
                        else if (item.name === 'meeting_coffee2') cupIndex = 2;
                        else if (item.name === 'meeting_coffee3') cupIndex = 3;
                        else if (item.name === 'meeting_coffee4') cupIndex = 4;
                        showDialog(getCoffeeHtml(cupIndex));
                    }
                });
                scene.appendChild(area);
            });
        })
        .catch(err => {
            console.error('fetch items.json error:', err);
        });

    dialogClose.addEventListener('click', function () {
        dialog.style.display = 'none';
    });

    function showDialog(html) {
        console.log('showDialog called');
        dialogContent.innerHTML = html;
        dialog.style.display = 'flex';
    }
}); 