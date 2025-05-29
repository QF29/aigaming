document.addEventListener('DOMContentLoaded', () => {
    // 获取场景元素
    const scene = document.getElementById('office-scene');
    const breakroomScene = document.getElementById('breakroom-scene');
    const sceneContainer = document.getElementById('office-scene-container');
    
    // 原始图片尺寸
    const originalWidth = 1920;
    const originalHeight = 1080;
    
    // 游戏状态
    const gameState = {
        // 场景状态
        currentScene: 'office', // 'office' 或 'breakroom'
        
        // 界面状态
        isComputerOn: false,
        isCodeLockOpen: false,
        isDocumentOpen: false,
        isTerminalOpen: false,
        isGalleryOpen: false,
        isTrashOpen: false,
        isDoorPanelOpen: false,
        
        // 解谜进度状态
        hasReadEmail: false,
        hasReadTerminal: false,
        hasViewedGallery: false,
        hasViewedTrash: false,
        doorUnlocked: false,
        breakroomUnlocked: false,
        
        // 门禁系统状态
        doorCode: "",
        hasInsertedKeycard: false,
        hasInsertedDevice: false,
        
        // 其他状态
        activeCodeLockTarget: null,
        currentCode: "0000",
        hintLevel: 0
    };
    
    // 文本标签 - 空对象，将被JSON文件填充
    let labels = {};
    
    // 可交互物品 - 默认值，将被JSON文件覆盖
    let interactiveItems = [];
    
    // 加载游戏数据并初始化
    loadGameData();
    
    // 加载标签数据
    function loadLabels() {
        return fetch('../labels.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('无法加载标签数据: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('标签数据加载成功');
                labels = data;
                return labels;
            })
            .catch(error => {
                console.error('加载标签数据失败:', error);
                throw error;
            });
    }
    
    // 加载物品数据
    function loadItems() {
        return fetch('../items.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('无法加载物品数据: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('物品数据加载成功');
                interactiveItems = data;
                return interactiveItems;
            })
            .catch(error => {
                console.error('加载物品数据失败:', error);
                throw error;
            });
    }
    
    // 加载游戏数据
    function loadGameData() {
        Promise.all([loadLabels(), loadItems()])
            .then(() => {
                console.log('所有数据加载完成');
                initGame();
            })
            .catch(error => {
                console.error('加载游戏数据出错:', error);
                // 检查labels.load_error是否存在
                const errorMessage = labels.load_error;
                showDialog(errorMessage);
            });
    }
    
    // 游戏初始化函数
    function initGame() {
        // 尝试加载保存的游戏状态
        loadGameState();
        
        // 创建可交互区域
        createInteractiveAreas();
        
        // 设置物品栏点击事件
        setupInventoryItems();
        
        // 设置密码锁事件
        setupCodeLock();
        
        // 设置场景切换事件
        setupSceneTransition();
        
        // 设置门禁面板事件
        setupDoorPanel();
        
        // 设置电脑应用事件
        setupComputerApps();
        
        // 显示欢迎信息
        const welcomeMessage = labels.welcome;
        showDialog(welcomeMessage);
        
        // 首次计算场景大小可能需要短暂延迟以确保CSS已完全应用
        setTimeout(updateInteractiveAreas, 100);
        
        // 显示或隐藏场景切换按钮
        updateSceneTransitionButton();
    }
    
    // 设置场景切换事件
    function setupSceneTransition() {
        document.getElementById('go-to-breakroom').addEventListener('click', () => {
            if (gameState.breakroomUnlocked) {
                switchScene('breakroom');
                showDialog(labels.breakroom_entered);
            } else {
                showDialog(labels.breakroom_door_examined);
                showBreakroomCodeLock();
            }
        });
        
        document.getElementById('go-to-office').addEventListener('click', () => {
            switchScene('office');
        });
    }
    
    // 更新场景切换按钮显示
    function updateSceneTransitionButton() {
        const transitionElement = document.getElementById('scene-transition');
        const goToBreakroomBtn = document.getElementById('go-to-breakroom');
        const goToOfficeBtn = document.getElementById('go-to-office');
        
        // 显示场景切换区域
        transitionElement.style.display = 'block';
        
        // 根据当前场景显示/隐藏按钮
        if (gameState.currentScene === 'office') {
            goToBreakroomBtn.style.display = 'block';
            goToOfficeBtn.style.display = 'none';
        } else {
            goToBreakroomBtn.style.display = 'none';
            goToOfficeBtn.style.display = 'block';
        }
    }
    
    // 切换场景
    function switchScene(targetScene) {
        if (targetScene === 'office') {
            scene.style.display = 'block';
            breakroomScene.style.display = 'none';
            gameState.currentScene = 'office';
        } else if (targetScene === 'breakroom') {
            scene.style.display = 'none';
            breakroomScene.style.display = 'block';
            gameState.currentScene = 'breakroom';
        }
        
        // 更新场景切换按钮
        updateSceneTransitionButton();
        
        // 更新可交互区域
        updateInteractiveAreas();
    }
    
    // 计算缩放比例
    function calculateScaleFactor() {
        const currentScene = gameState.currentScene === 'office' ? scene : breakroomScene;
        const sceneRect = currentScene.getBoundingClientRect();
        const sceneWidth = sceneRect.width;
        // 16:9 比例下的高度
        const sceneHeight = sceneWidth * (originalHeight / originalWidth);
        
        return {
            x: sceneWidth / originalWidth,
            y: sceneHeight / originalHeight
        };
    }
    
    // 创建可交互区域
    function createInteractiveAreas() {
        const scale = calculateScaleFactor();
        const currentScene = gameState.currentScene === 'office' ? scene : breakroomScene;
        
        // 清除当前场景中的所有可交互区域
        const existingAreas = currentScene.querySelectorAll('.interactive-area');
        existingAreas.forEach(area => area.remove());
        
        interactiveItems.forEach(item => {
            // 跳过不属于当前场景的物品
            if (item.scene && item.scene !== gameState.currentScene) {
                return;
            }
            
            // 跳过没有场景属性且当前在茶水间的物品（默认场景是办公室）
            if (!item.scene && gameState.currentScene === 'breakroom') {
                return;
            }
            
            // 跳过隐藏的物品
            if (item.hidden && !item.revealed) {
                return;
            }
            
            const area = document.createElement('div');
            area.className = 'interactive-area';
            
            // 应用缩放比例
            const scaledX = item.x * scale.x;
            const scaledY = item.y * scale.y;
            const scaledWidth = item.width * scale.x;
            const scaledHeight = item.height * scale.y;
            
            area.style.left = `${scaledX}px`;
            area.style.top = `${scaledY}px`;
            area.style.width = `${scaledWidth}px`;
            area.style.height = `${scaledHeight}px`;
            area.dataset.name = item.name;
            area.dataset.originalX = item.x;
            area.dataset.originalY = item.y;
            area.dataset.originalWidth = item.width;
            area.dataset.originalHeight = item.height;
            
            area.addEventListener('click', () => {
                // 如果有界面打开，不处理点击
                if (isAnyInterfaceOpen()) return;
                
                // 处理特殊物品交互
                handleItemInteraction(item);
            });
            
            currentScene.appendChild(area);
        });
        
        // 初始化已收集的物品
        updateInventoryDisplay();
    }
    
    // 检查是否有界面打开
    function isAnyInterfaceOpen() {
        return gameState.isComputerOn || 
               gameState.isCodeLockOpen || 
               gameState.isDocumentOpen ||
               gameState.isTerminalOpen ||
               gameState.isGalleryOpen ||
               gameState.isTrashOpen ||
               gameState.isDrawerPanelOpen ||
               gameState.isDoorPanelOpen;
    }
    
    // 处理物品交互
    function handleItemInteraction(item) {
        // 显示物品描述 - 只在有label_key且标签存在时显示
        if (item.label_key && labels[item.label_key]) {
            showDialog(labels[item.label_key]);
        }
        
        // 处理特殊动作
        if (item.action) {
            switch(item.action) {
                case 'showComputer':
                    showComputer();
                    return;
                case 'showBreakroomCodeLock':
                    showBreakroomCodeLock();
                    return;
                case 'showDoorSecurityPanel':
                    // 使用新的门禁系统界面
                    showDoorSecurityPanel();
                    return;
            }
        }
        
        // 处理特定物品
        switch(item.name) {
            case 'door':
                if (gameState.doorUnlocked) {
                    // 玩家已解决谜题，游戏胜利
                    showDialog(labels.door_unlocked);
                    setTimeout(() => {
                        alert("恭喜你，成功逃离了办公室！游戏结束。");
                    }, 2000);
                } else {
                    showDialog(labels.door_locked);
                    // 改用新的门禁系统界面
                    showDoorSecurityPanel();
                }
                break;
                
            case 'calendar':
                showDialog(labels.calendar_examined);
                break;
                
            case 'plant':
                showDialog(labels.plant_examined);
                // 检查玩家是否已经找到纸团
                const paper = findItemByName('paper');
                if (!paper.collected) {
                    // 玩家找到纸团
                    setTimeout(() => {
                        showDialog(labels.paper_found);
                        collectItem(paper);
                    }, 1500);
                }
                break;
                
            case 'window':
                showDialog(labels.window_examined);
                break;
                
            case 'document':
                // 显示详细的入职材料信息
                showDocumentInfo();
                break;
                
            case 'desk_drawers':
                showDialog(labels.desk_drawers_examined);
                break;
                
            case 'breakroom_door':
                showDialog(labels.breakroom_door_examined);
                showBreakroomCodeLock();
                break;
                
            case 'breakroom_coffee_machine':
                showDialog(labels.coffee_machine_examined);
                break;
                
            case 'coffee_machine_button':
                showDialog(labels.coffee_machine_button_pressed);
                // 玩家找到纸条
                const coffeeNote = findItemByName('coffee_machine_note');
                if (!coffeeNote.collected) {
                    setTimeout(() => {
                        showDialog(labels.coffee_machine_note_found);
                        collectItem(coffeeNote);
                    }, 1500);
                }
                break;
                
            case 'breakroom_microwave':
                showDialog(labels.microwave_examined);
                break;
                
            case 'breakroom_fridge':
                showDialog(labels.fridge_examined);
                break;
                
            case 'fridge_drawer':
                showDialog(labels.fridge_drawer_examined);
                // 玩家找到设备和纸条
                const device = findItemByName('device');
                const fridgeNote = findItemByName('fridge_note');
                
                if (!device.collected) {
                    setTimeout(() => {
                        showDialog(labels.device_found);
                        collectItem(device);
                    }, 1500);
                }
                
                if (!fridgeNote.collected) {
                    setTimeout(() => {
                        showDialog(labels.fridge_note_found);
                        collectItem(fridgeNote);
                    }, 3000);
                }
                break;
        }
        
        // 处理可收集物品
        if (item.collectible && !item.collected) {
            collectItem(item);
        }
    }
    
    // 根据名称查找物品
    function findItemByName(name) {
        return interactiveItems.find(item => item.name === name);
    }
    
    // 收集物品
    function collectItem(item) {
        // 更新物品状态为已收集
        item.collected = true;
        
        // 使用标签显示收集提示
        if (item.label_key && labels[item.label_key]) {
            const description = labels[item.label_key].split('。')[0];
            showDialog(`你获得了${description}`);
        } else {
            showDialog(`你获得了${item.name}`);
        }
        
        // 更新物品栏显示
        updateInventoryDisplay();
        
        // 将更改保存到localStorage
        saveGameState();
    }
    
    // 更新物品栏显示
    function updateInventoryDisplay() {
        // 清空所有物品槽（除了帮助槽）
        document.querySelectorAll('.inventory-slot').forEach(slot => {
            if (slot.id !== 'help-slot') {
                slot.innerHTML = '';
            }
        });
        
        // 获取所有已收集的物品
        const collectedItems = interactiveItems.filter(item => item.collectible && item.collected);
        
        // 获取所有物品槽（除了帮助槽）
        const slots = Array.from(document.querySelectorAll('.inventory-slot'))
            .filter(slot => slot.id !== 'help-slot');
        
        // 按顺序将物品放入槽位，不留空格
        collectedItems.forEach((item, index) => {
            if (index < slots.length) {
                const slot = slots[index];
                
                // 创建物品图标
                const icon = document.createElement('div');
                icon.className = 'inventory-item';
                icon.id = `${item.name}-icon`; // 保持物品ID对应关系
                
                // 为了解决引用问题，我们创建一个变量保存当前项目
                const currentItem = item;
                
                // 添加点击事件
                icon.addEventListener('click', () => {
                    // 针对入职材料特殊处理
                    if (currentItem.name === 'document') {
                        showDocumentInfo();
                    } else if (currentItem.label_key && labels[currentItem.label_key]) {
                        showDialog(labels[currentItem.label_key]);
                    }
                });
                
                // 将图标添加到槽位
                slot.appendChild(icon);
                
                // 为槽位添加数据属性，以便后续能够查找特定物品对应的槽位
                slot.dataset.itemName = item.name;
            }
        });
    }
    
    // 设置密码锁事件
    function setupCodeLock() {
        // 初始化密码显示
        document.getElementById('code-display').textContent = gameState.currentCode;
        
        // 数字按钮点击事件
        document.querySelectorAll('.number-button').forEach(button => {
            button.addEventListener('click', () => {
                const digit = button.dataset.digit;
                updateCodeDisplay(digit);
            });
        });
        
        // 确认按钮点击事件
        document.getElementById('confirm-code').addEventListener('click', () => {
            checkCode();
        });
        
        // 关闭按钮点击事件
        document.getElementById('close-lock').addEventListener('click', () => {
            hideCodeLock();
        });
    }
    
    // 显示密码锁
    function showCodeLock() {
        document.getElementById('code-lock').style.display = 'block';
        gameState.isCodeLockOpen = true;
        
        // 重置密码显示
        gameState.currentCode = "000";
        document.getElementById('code-display').textContent = "000";
    }
    
    // 隐藏密码锁
    function hideCodeLock() {
        document.getElementById('code-lock').style.display = 'none';
        gameState.isCodeLockOpen = false;
        gameState.activeCodeLockTarget = null;
    }
    
    // 更新密码显示
    function updateCodeDisplay(digit) {
        if (gameState.currentCode === "000") {
            gameState.currentCode = digit;
        } else if (gameState.currentCode.length < 4) {
            gameState.currentCode += digit;
        } else {
            // 如果已经有4位数字，替换最后一位
            gameState.currentCode = gameState.currentCode.substring(0, 3) + digit;
        }
        
        // 更新显示
        document.getElementById('code-display').textContent = gameState.currentCode;
    }
    
    // 检查密码
    function checkCode() {
        // 根据当前的目标选择不同的处理逻辑
        if (gameState.activeCodeLockTarget === 'breakroom_door') {
            checkBreakroomCode();
        } else {
            // 默认逻辑
            showDialog(labels.wrong_code);
            hideCodeLock();
        }
    }
    
    // 设置电脑应用事件
    function setupComputerApps() {
        // 终端应用
        document.getElementById('close-terminal').addEventListener('click', () => {
            hideTerminal();
        });
        
        // 照片查看器
        document.getElementById('close-gallery').addEventListener('click', () => {
            hideGallery();
        });
        
        // 垃圾箱
        document.getElementById('close-trash').addEventListener('click', () => {
            hideTrash();
        });
        
        // 照片缩略图点击事件
        document.querySelectorAll('.gallery-thumbnail').forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                const imageId = thumbnail.dataset.image;
                showGalleryImage(imageId);
            });
        });
        
        // 垃圾箱项目点击事件
        document.querySelectorAll('.trash-item').forEach(item => {
            item.addEventListener('click', () => {
                const fileId = item.dataset.file;
                showTrashPreview(fileId);
            });
        });
    }
    
    // 显示终端界面
    function showTerminal() {
        hideDesktop();
        document.getElementById('terminal-screen').style.display = 'block';
        gameState.isTerminalOpen = true;
        gameState.hasReadTerminal = true;
        
        // 清除终端内容，只保留初始提示
        const terminalContent = document.querySelector('.terminal-content');
        terminalContent.innerHTML = `
            <div class="terminal-line">
                <span class="terminal-prompt">$</span> <span class="terminal-text">系统登录: 管理员</span>
            </div>
            <div class="terminal-line">
                <span class="terminal-prompt">$</span> <span class="terminal-text">权限检查通过</span>
            </div>
            <div class="terminal-line">
                <span class="terminal-prompt">$</span> <span class="terminal-text">欢迎来到QuantumOS v2.7.3</span>
            </div>
            <div class="terminal-line">
                <span class="terminal-prompt">$</span> <span class="terminal-text">输入"help"获取可用命令</span>
            </div>
        `;
        
        // 设置终端输入事件 - setupTerminalInput会自动添加带光标的命令行
        setupTerminalInput();
        
        // 显示相关提示
        setTimeout(() => {
            showDialog(labels.terminal_examined);
        }, 1500);
        
        saveGameState();
    }
    
    // 设置终端输入功能
    function setupTerminalInput() {
        // 获取或创建最后一行命令行
        let terminalContent = document.querySelector('.terminal-content');
        let lastLine = terminalContent.querySelector('.terminal-line:last-child .terminal-text');
        
        if (!lastLine || !lastLine.textContent.trim().endsWith('_')) {
            // 如果没有最后一行或最后一行没有光标，创建一个新行
            const newCommandLine = document.createElement('div');
            newCommandLine.className = 'terminal-line';
            newCommandLine.innerHTML = `<span class="terminal-prompt">$</span> <span class="terminal-text"><span class="cursor-blink">_</span></span>`;
            terminalContent.appendChild(newCommandLine);
            
            // 更新lastLine引用
            lastLine = terminalContent.querySelector('.terminal-line:last-child .terminal-text');
        }
        
        // 为整个终端屏幕添加点击和键盘事件
        const terminalScreen = document.getElementById('terminal-screen');
        
        // 清除之前的事件监听器（如果有）
        if (terminalScreen._keydownHandler) {
            terminalScreen.removeEventListener('keydown', terminalScreen._keydownHandler);
        }
        
        // 设置键盘事件
        const keydownHandler = function(e) {
            // 重新获取最后一行，确保使用最新的
            const currentLastLine = document.querySelector('.terminal-content .terminal-line:last-child .terminal-text');
            
            if (e.key === 'Enter') {
                // 获取当前命令（将光标替换为空）
                const currentCommand = currentLastLine.textContent.replace('_', '');
                
                // 保留当前行，只移除光标，保持显示命令
                currentLastLine.innerHTML = currentCommand;
                
                // 处理命令
                processTerminalCommand(currentCommand);
                
                // 滚动到底部
                terminalContent.scrollTop = terminalContent.scrollHeight;
                
                // 创建新的命令行，带有闪烁光标
                const newCommandLine = document.createElement('div');
                newCommandLine.className = 'terminal-line';
                newCommandLine.innerHTML = `<span class="terminal-prompt">$</span> <span class="terminal-text"><span class="cursor-blink">_</span></span>`;
                terminalContent.appendChild(newCommandLine);
                
                // 重新设置输入事件
                setupTerminalInput();
                
                e.preventDefault();
            } else if (e.key.length === 1) {
                // 添加字符
                const text = currentLastLine.textContent.replace('_', '');
                currentLastLine.innerHTML = text + e.key + '<span class="cursor-blink">_</span>';
                e.preventDefault();
            } else if (e.key === 'Backspace') {
                // 删除最后一个字符
                const text = currentLastLine.textContent.replace('_', '');
                if (text.length > 0) {
                    currentLastLine.innerHTML = text.substring(0, text.length - 1) + '<span class="cursor-blink">_</span>';
                }
                e.preventDefault();
            }
        };
        
        // 保存事件处理函数的引用
        terminalScreen._keydownHandler = keydownHandler;
        
        // 添加键盘事件监听器
        terminalScreen.addEventListener('keydown', keydownHandler);
        
        // 点击终端时聚焦，使键盘事件生效
        terminalScreen.addEventListener('click', function() {
            terminalScreen.focus();
        });
        
        // 使终端可聚焦
        terminalScreen.tabIndex = 0;
        terminalScreen.focus();
        
        // 滚动到底部
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }
    
    // 处理终端命令
    function processTerminalCommand(command) {
        // 获取终端内容容器
        const terminalContent = document.querySelector('.terminal-content');
        
        // 注意：不再创建命令行，因为已经在当前行显示了命令
        // 命令已经在当前行显示，所以不需要重复创建命令行
        
        // 处理不同的命令
        if (command.trim() === 'secret') {
            // 添加secret命令的输出
            const secretOutput = [
                '[个人日志 - S.L. - 项目日第189天]',
                '我无法继续沉默了。量子意识克隆实验已经远远超出了伦理边界。实验主管声称这只是为了推进"永生"技术，但实际上我们是在创造可被奴役的数字意识。',
                '测试对象27号（林默）表现出异常的自我意识。根据日志，他是第一个质疑自己处境的克隆体。这很危险，但也给了我希望。也许他能打破这个循环。',
                '我已经在系统中植入了几个"漏洞"，希望他能利用这些逃离。如果你正在读这段话，林默，请记住：你所看到的世界只是代码构建的幻象。实验室正尝试稳定你的意识模式，让你接受这个虚拟现实。抵抗它！',
                '我的访问权限可能很快就会被发现并撤销。如果我消失了，请记住最后一条线索：真正的出口永远藏在最显眼的地方，就像代码中那些人人都能看到却没人注意的注释。',
                '记住，在递归中，出口就是入口的镜像。',
                '- S.L. (系统漏洞)'
            ];
            
            secretOutput.forEach(line => {
                const outputLine = document.createElement('div');
                outputLine.className = 'terminal-line';
                outputLine.innerHTML = `<span class="terminal-prompt"></span> <span class="terminal-text">${line}</span>`;
                terminalContent.appendChild(outputLine);
            });
            
            // 显示对话提示
            showDialog(labels.terminal_secret_found);
        } else if (command.trim() === 'ls') {
            // 添加ls命令的输出
            const lsOutput = [
                'accesslogs.txt',
                'backdoor.sh'
            ];
            
            lsOutput.forEach(line => {
                const outputLine = document.createElement('div');
                outputLine.className = 'terminal-line';
                outputLine.innerHTML = `<span class="terminal-prompt"></span> <span class="terminal-text">${line}</span>`;
                terminalContent.appendChild(outputLine);
            });
        } else if (command.trim().startsWith('cat ')) {
            const fileName = command.trim().substring(4);
            
            if (fileName === 'accesslogs.txt') {
                const catOutput = [
                    '最近访问记录：',
                    '茶水间.ID=7734',
                    '实验室.ID=????',
                    '紧急出口.ID=????'
                ];
                
                catOutput.forEach(line => {
                    const outputLine = document.createElement('div');
                    outputLine.className = 'terminal-line';
                    outputLine.innerHTML = `<span class="terminal-prompt"></span> <span class="terminal-text">${line}</span>`;
                    terminalContent.appendChild(outputLine);
                });
            } else if (fileName === 'backdoor.sh') {
                const catOutput = [
                    'if (input == reverse(original_code)) {',
                    '  door.unlock();',
                    '} else {',
                    '  alarm.trigger();',
                    '}'
                ];
                
                catOutput.forEach(line => {
                    const outputLine = document.createElement('div');
                    outputLine.className = 'terminal-line';
                    outputLine.innerHTML = `<span class="terminal-prompt"></span> <span class="terminal-text">${line}</span>`;
                    terminalContent.appendChild(outputLine);
                });
            } else {
                const outputLine = document.createElement('div');
                outputLine.className = 'terminal-line';
                outputLine.innerHTML = `<span class="terminal-prompt"></span> <span class="terminal-text">文件未找到: ${fileName}</span>`;
                terminalContent.appendChild(outputLine);
            }
        } else if (command.trim() === 'help') {
            const helpOutput = [
                '可用命令:',
                '- ls - 列出当前目录文件',
                '- cat [文件名] - 查看文件内容',
                '- secre - ?? '
            ];
            
            helpOutput.forEach(line => {
                const outputLine = document.createElement('div');
                outputLine.className = 'terminal-line';
                outputLine.innerHTML = `<span class="terminal-prompt"></span> <span class="terminal-text">${line}</span>`;
                terminalContent.appendChild(outputLine);
            });
        } else {
            const outputLine = document.createElement('div');
            outputLine.className = 'terminal-line';
            outputLine.innerHTML = `<span class="terminal-prompt"></span> <span class="terminal-text">未知命令: ${command}</span>`;
            terminalContent.appendChild(outputLine);
        }
        
        // 不再在这里添加新的命令行，而是在setupTerminalInput中处理
        // 滚动到底部
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }
    
    // 隐藏终端界面
    function hideTerminal() {
        document.getElementById('terminal-screen').style.display = 'none';
        gameState.isTerminalOpen = false;
        showDesktop();
    }
    
    // 显示照片查看器
    function showGallery() {
        hideDesktop();
        document.getElementById('gallery-screen').style.display = 'block';
        gameState.isGalleryOpen = true;
        gameState.hasViewedGallery = true;
        
        // 默认显示第一张照片
        showGalleryImage('office');
        
        // 显示相关提示
        setTimeout(() => {
            showDialog(labels.gallery_examined);
        }, 1500);
        
        saveGameState();
    }
    
    // 显示指定照片
    function showGalleryImage(imageId) {
        const galleryImage = document.getElementById('gallery-image');
        const galleryCaption = document.getElementById('gallery-caption');
        
        // 设置图片路径 - 修复图片路径问题
        if (imageId === 'door') {
            galleryImage.src = `./public/images/door.png`; // 使用door.png
        } else if (imageId === 'office') {
            galleryImage.src = `./public/images/office.png`; // 使用office.png
        } else if (imageId === 'breakroom') {
            galleryImage.src = `./public/images/office.png`; // 暂时也用office.png替代
        } else {
            galleryImage.src = `./public/images/office.png`; // 默认使用office.png
        }
        
        // 设置图片说明
        switch(imageId) {
            case 'office':
                galleryCaption.textContent = '办公室全景图 - 拍摄于项目第一天';
                break;
            case 'door':
                galleryCaption.textContent = '门禁系统特写 - 需要门禁卡和4位密码';
                break;
            case 'breakroom':
                galleryCaption.textContent = '茶水间 - 员工休息区';
                break;
            default:
                galleryCaption.textContent = '未知图片';
        }
    }
    
    // 隐藏照片查看器
    function hideGallery() {
        document.getElementById('gallery-screen').style.display = 'none';
        gameState.isGalleryOpen = false;
        showDesktop();
    }
    
    // 显示垃圾箱
    function showTrash() {
        hideDesktop();
        document.getElementById('trash-screen').style.display = 'block';
        gameState.isTrashOpen = true;
        gameState.hasViewedTrash = true;
        
        // 设置垃圾箱项目点击事件
        setupTrashItems();
        
        // 显示相关提示
        setTimeout(() => {
            showDialog(labels.trash_examined);
        }, 1500);
        
        saveGameState();
    }
    
    // 设置垃圾箱项目点击事件
    function setupTrashItems() {
        // 清除之前的事件监听器
        const trashItems = document.querySelectorAll('.trash-item');
        trashItems.forEach(item => {
            // 移除之前的事件监听器（如果有）
            const oldHandler = item._clickHandler;
            if (oldHandler) {
                item.removeEventListener('click', oldHandler);
            }
            
            // 创建新的处理函数
            const clickHandler = function() {
                const fileId = this.dataset.file;
                showTrashPreview(fileId);
            };
            
            // 保存处理函数引用
            item._clickHandler = clickHandler;
            
            // 添加新的事件监听器
            item.addEventListener('click', clickHandler);
        });
        
        // 设置关闭按钮事件
        const closeButton = document.getElementById('close-trash');
        
        // 移除之前的事件监听器（如果有）
        const oldCloseHandler = closeButton._clickHandler;
        if (oldCloseHandler) {
            closeButton.removeEventListener('click', oldCloseHandler);
        }
        
        // 创建新的处理函数
        const closeHandler = function() {
            hideTrash();
        };
        
        // 保存处理函数引用
        closeButton._clickHandler = closeHandler;
        
        // 添加新的事件监听器
        closeButton.addEventListener('click', closeHandler);
    }
    
    // 显示垃圾箱文件预览
    function showTrashPreview(fileId) {
        const previewHeader = document.getElementById('trash-preview-header');
        const previewContent = document.getElementById('trash-preview-content');
        
        // 根据fileId显示不同的内容
        if (fileId === 'report1') {
            previewHeader.textContent = '实验记录.txt';
            
            // 从文件中读取内容
            fetch('./public/data/report1.txt')
                .then(response => response.text())
                .then(text => {
                    previewContent.innerHTML = text;
                    // 显示对话提示
                    showDialog(labels.report1_found);
                })
                .catch(error => {
                    console.error('无法加载实验记录:', error);
                    previewContent.innerHTML = "文件加载失败";
                });
        } else if (fileId === 'report2') {
            previewHeader.textContent = '实验日志.txt';
            
            // 从文件中读取内容
            fetch('./public/data/report2.txt')
                .then(response => response.text())
                .then(text => {
                    previewContent.innerHTML = text;
                    // 显示对话提示
                    showDialog(labels.report2_found);
                })
                .catch(error => {
                    console.error('无法加载实验日志:', error);
                    previewContent.innerHTML = "文件加载失败";
                });
        } else if (fileId === 'note') {
            previewHeader.textContent = '私人笔记.txt';
            
            // 从文件中读取内容
            fetch('./public/data/private_note.txt')
                .then(response => response.text())
                .then(text => {
                    previewContent.innerHTML = text;
                    // 显示对话提示
                    showDialog(labels.private_note_found);
                })
                .catch(error => {
                    console.error('无法加载私人笔记:', error);
                    previewContent.innerHTML = "文件加载失败";
                });
        }
    }
    
    // 隐藏垃圾箱
    function hideTrash() {
        document.getElementById('trash-screen').style.display = 'none';
        gameState.isTrashOpen = false;
        showDesktop();
    }
    
    // 显示文件夹界面
    function showFolderScreen() {
        hideDesktop();
        document.getElementById('folder-screen').style.display = 'block';
        
        // 设置文件点击事件
        setupFolderFiles();
        
        // 显示相关提示
        showDialog(labels.folder_encrypted);
    }
    
    // 隐藏文件夹界面
    function hideFolderScreen() {
        document.getElementById('folder-screen').style.display = 'none';
        showDesktop();
    }
    
    // 设置文件夹中的文件点击事件
    function setupFolderFiles() {
        // 清除之前的事件监听器
        const files = document.querySelectorAll('.folder-file');
        files.forEach(file => {
            // 移除之前的事件监听器（如果有）
            const oldHandler = file._clickHandler;
            if (oldHandler) {
                file.removeEventListener('click', oldHandler);
            }
            
            // 创建新的处理函数
            const clickHandler = function() {
                const fileId = this.dataset.file;
                showFileContent(fileId);
            };
            
            // 保存处理函数引用
            file._clickHandler = clickHandler;
            
            // 添加新的事件监听器
            file.addEventListener('click', clickHandler);
        });
        
        // 设置关闭按钮事件
        const closeButton = document.getElementById('close-folder');
        // 移除之前的事件监听器（如果有）
        const oldCloseHandler = closeButton._clickHandler;
        if (oldCloseHandler) {
            closeButton.removeEventListener('click', oldCloseHandler);
        }
        
        // 创建新的处理函数
        const closeHandler = function() {
            hideFolderScreen();
        };
        
        // 保存处理函数引用
        closeButton._clickHandler = closeHandler;
        
        // 添加新的事件监听器
        closeButton.addEventListener('click', closeHandler);
    }
    
    // 显示文件内容
    function showFileContent(fileId) {
        const fileContentScreen = document.getElementById('file-content-screen');
        const fileContentTitle = document.getElementById('file-content-title');
        const fileContentText = document.getElementById('file-content-text');
        
        // 设置关闭按钮事件
        const closeButton = document.getElementById('close-file-content');
        // 移除之前的事件监听器（如果有）
        const oldCloseHandler = closeButton._clickHandler;
        if (oldCloseHandler) {
            closeButton.removeEventListener('click', oldCloseHandler);
        }
        
        // 创建新的处理函数
        const closeHandler = function() {
            fileContentScreen.style.display = 'none';
        };
        
        // 保存处理函数引用
        closeButton._clickHandler = closeHandler;
        
        // 添加新的事件监听器
        closeButton.addEventListener('click', closeHandler);
        
        // 根据fileId显示不同的内容
        if (fileId === 'joke') {
            fileContentTitle.textContent = '开发者笑话.txt';
            fileContentText.textContent = "为什么程序员总是分不清万圣节和圣诞节？因为 Oct 31 == Dec 25";
        }
        
        fileContentScreen.style.display = 'block';
    }
    
    // 新的门禁系统界面
    function showDoorSecurityPanel() {
        document.getElementById('door-security-panel').style.display = 'block';
        gameState.isDoorPanelOpen = true;
        
        // 更新门禁卡和设备状态显示
        updateDoorSecurityDisplay();
        
        // 设置按钮事件
        setupDoorSecurityEvents();
    }
    
    // 隐藏门禁系统界面
    function hideDoorSecurityPanel() {
        document.getElementById('door-security-panel').style.display = 'none';
        gameState.isDoorPanelOpen = false;
    }
    
    // 设置门禁系统事件
    function setupDoorSecurityEvents() {
        // 关闭按钮
        document.getElementById('close-door-security').addEventListener('click', hideDoorSecurityPanel);
        
        // 取消按钮
        document.getElementById('door-security-cancel').addEventListener('click', hideDoorSecurityPanel);
        
        // 数字按键事件
        document.querySelectorAll('.door-security-key').forEach(key => {
            key.addEventListener('click', () => {
                const digit = key.dataset.digit;
                updateDoorSecurityCode(digit);
            });
        });
        
        // 门禁卡槽点击事件
        document.getElementById('door-card-slot').addEventListener('click', () => {
            insertDoorSecurityCard();
        });
        
        // 设备槽点击事件
        document.getElementById('door-device-slot').addEventListener('click', () => {
            insertDoorSecurityDevice();
        });
        
        // 解锁按钮
        document.getElementById('door-security-unlock').addEventListener('click', () => {
            tryDoorSecurityUnlock();
        });
    }
    
    // 更新门禁系统显示
    function updateDoorSecurityDisplay() {
        // 更新门禁卡状态
        const cardEmpty = document.getElementById('door-security-card-empty');
        const cardInserted = document.getElementById('door-security-card-inserted');
        
        if (gameState.hasInsertedKeycard) {
            cardEmpty.style.display = 'none';
            cardInserted.style.display = 'block';
        } else {
            cardEmpty.style.display = 'block';
            cardInserted.style.display = 'none';
        }
        
        // 更新设备状态
        const deviceEmpty = document.getElementById('door-security-device-empty');
        const deviceInserted = document.getElementById('door-security-device-inserted');
        
        if (gameState.hasInsertedDevice) {
            deviceEmpty.style.display = 'none';
            deviceInserted.style.display = 'block';
        } else {
            deviceEmpty.style.display = 'block';
            deviceInserted.style.display = 'none';
        }
        
        // 更新密码显示
        document.getElementById('door-security-display').textContent = gameState.doorCode || '____';
    }
    
    // 插入门禁卡
    function insertDoorSecurityCard() {
        const keycard = findItemByName('keycard');
        
        if (keycard.collected) {
            gameState.hasInsertedKeycard = true;
            updateDoorSecurityDisplay();
            showDialog(labels.card_inserted);
        } else {
            showDialog(labels.need_keycard);
        }
    }
    
    // 插入破解设备
    function insertDoorSecurityDevice() {
        const device = findItemByName('device');
        
        if (device.collected) {
            gameState.hasInsertedDevice = true;
            updateDoorSecurityDisplay();
            showDialog(labels.device_inserted);
            
            // 如果门禁卡也已插入，显示组合提示
            if (gameState.hasInsertedKeycard) {
                setTimeout(() => {
                    showDialog(labels.device_and_keycard_combined);
                }, 1500);
            }
        } else {
            showDialog(labels.need_device);
        }
    }
    
    // 更新门禁系统密码
    function updateDoorSecurityCode(digit) {
        // 如果没有插入门禁卡和设备，不能输入密码
        if (!gameState.hasInsertedKeycard || !gameState.hasInsertedDevice) {
            showDialog(labels.need_both_items);
            return;
        }
        
        // 更新密码
        if (gameState.doorCode.length < 4) {
            gameState.doorCode += digit;
        } else {
            // 如果已经有4位数字，替换最后一位
            gameState.doorCode = gameState.doorCode.substring(0, 3) + digit;
        }
        
        // 更新显示
        document.getElementById('door-security-display').textContent = gameState.doorCode;
    }
    
    // 尝试解锁门
    function tryDoorSecurityUnlock() {
        // 检查是否插入了门禁卡和设备
        if (!gameState.hasInsertedKeycard || !gameState.hasInsertedDevice) {
            showDialog(labels.need_both_items);
            return;
        }
        
        // 检查密码长度
        if (gameState.doorCode.length < 4) {
            showDialog(labels.need_complete_code);
            return;
        }
        
        // 检查密码是否正确 - 根据提示，密码是"7734"的逆序，即"4377"
        if (gameState.doorCode === "4377") {
            // 正确密码
            showDialog(labels.door_unlocked);
            gameState.doorUnlocked = true;
            hideDoorSecurityPanel();
            
            // 保存游戏状态
            saveGameState();
            
            // 2秒后提示游戏胜利
            setTimeout(() => {
                alert("恭喜你，成功逃离了办公室！游戏结束。");
            }, 2000);
        } else {
            // 错误密码
            showDialog(labels.wrong_password);
            // 清空密码
            gameState.doorCode = "";
            document.getElementById('door-security-display').textContent = '____';
        }
    }
    
    // 显示茶水间密码锁
    function showBreakroomCodeLock() {
        // 重用密码锁界面
        document.getElementById('code-lock').style.display = 'block';
        gameState.isCodeLockOpen = true;
        gameState.activeCodeLockTarget = 'breakroom_door';
        
        // 重置密码显示
        gameState.currentCode = "0000";
        document.getElementById('code-display').textContent = "0000";
    }
    
    // 检查茶水间密码
    function checkBreakroomCode() {
        const breakroomDoor = findItemByName('breakroom_door');
        
        // 检查密码是否正确
        if (gameState.currentCode === breakroomDoor.keycode) {
            // 密码正确
            showDialog(labels.breakroom_door_unlocked);
            hideCodeLock();
            
            // 更新游戏状态
            gameState.breakroomUnlocked = true;
            
            // 切换到茶水间场景
            setTimeout(() => {
                switchScene('breakroom');
                showDialog(labels.breakroom_entered);
            }, 1500);
            
            // 保存游戏状态
            saveGameState();
        } else {
            // 密码错误
            showDialog(labels.wrong_password);
        }
    }
    
    // 更新可交互区域位置和大小（在窗口大小变化时调用）
    function updateInteractiveAreas() {
        const scale = calculateScaleFactor();
        const areas = document.querySelectorAll('.interactive-area');
        
        areas.forEach(area => {
            const originalX = parseFloat(area.dataset.originalX);
            const originalY = parseFloat(area.dataset.originalY);
            const originalWidth = parseFloat(area.dataset.originalWidth);
            const originalHeight = parseFloat(area.dataset.originalHeight);
            
            const scaledX = originalX * scale.x;
            const scaledY = originalY * scale.y;
            const scaledWidth = originalWidth * scale.x;
            const scaledHeight = originalHeight * scale.y;
            
            area.style.left = `${scaledX}px`;
            area.style.top = `${scaledY}px`;
            area.style.width = `${scaledWidth}px`;
            area.style.height = `${scaledHeight}px`;
        });
    }
    
    // 监听窗口大小变化
    window.addEventListener('resize', updateInteractiveAreas);
    
    // 显示邮件屏幕
    function showEmailScreen() {
        // 隐藏桌面，显示邮件内容
        document.getElementById('computer-desktop').style.display = 'none';
        document.getElementById('computer-content').style.display = 'block';
        
        const computerContent = document.getElementById('computer-content');
        computerContent.innerHTML = `
            <div class="system-notification">
                <div class="notification-icon"></div>
                <div class="notification-text">安全验证通过</div>
            </div>
            
            <div class="os-interface">
                <div class="interface-header">
                    <h3>终端用户界面 - 收件箱</h3>
                    <div class="interface-controls">
                        <span class="control-dot"></span>
                        <span class="control-dot"></span>
                        <span class="control-dot"></span>
                    </div>
                </div>
                
                <div class="email-container">
                    <div class="email-header">
                        <div class="email-meta">
                            <div><strong>主题：</strong> <span class="highlight-text">别相信他们</span></div>
                            <div><strong>发件人：</strong> <span class="encrypted-text">加密来源</span></div>
                            <div><strong>时间：</strong> 今天 2:47</div>
                            <div><strong>安全级别：</strong> <span class="danger-text">紧急</span></div>
                        </div>
                    </div>
                    
                    <div class="email-body">
                        <p>林默，</p>
                        <p>如果你看到这条消息，说明我成功把它植入了系统。你必须小心，<span class="highlight-text">"现实重构"</span>项目不是你想象的那样。</p>
                        <p>我没有太多时间解释。你必须逃离这个办公室，但办公室的门被特殊的锁锁住了。</p>
                        <p>茶水间有我留下的东西，会帮助你逃离。记住：<strong class="important-text">真相在表面之下</strong>。</p>
                        <p class="signature">祝你好运。——S.L.</p>
                    </div>
                </div>
            </div>
            <button class="back-button" id="back-to-desktop">返回桌面</button>
        `;
        
        // 添加返回桌面按钮事件
        document.getElementById('back-to-desktop').addEventListener('click', showDesktop);
        
        // 显示相关提示
        setTimeout(() => {
            showDialog(labels.email_revealed);
        }, 2000);
    }
    
    // 保存游戏状态到localStorage
    function saveGameState() {
        const state = {
            currentScene: gameState.currentScene,
            isComputerOn: gameState.isComputerOn,
            hasReadEmail: gameState.hasReadEmail,
            hasReadTerminal: gameState.hasReadTerminal,
            hasViewedGallery: gameState.hasViewedGallery,
            hasViewedTrash: gameState.hasViewedTrash,
            doorUnlocked: gameState.doorUnlocked,
            breakroomUnlocked: gameState.breakroomUnlocked,
            hasInsertedKeycard: gameState.hasInsertedKeycard,
            hasInsertedDevice: gameState.hasInsertedDevice,
            doorCode: gameState.doorCode,
            hintLevel: gameState.hintLevel,
            
            // 记录已收集物品
            collectedItems: interactiveItems
                .filter(item => item.collectible && item.collected)
                .map(item => item.name),
            
            // 记录已揭示物品
            revealedItems: interactiveItems
                .filter(item => item.hidden && item.revealed)
                .map(item => item.name),
        };
        
        localStorage.setItem('lockedOfficeGameState', JSON.stringify(state));
        console.log('游戏状态已保存');
    }
    
    // 从localStorage加载游戏状态
    function loadGameState() {
        const savedState = localStorage.getItem('lockedOfficeGameState');
        if (!savedState) {
            console.log('没有找到保存的游戏状态');
            return;
        }
        
        try {
            const parsedState = JSON.parse(savedState);
            
            // 恢复游戏状态
            gameState.currentScene = parsedState.currentScene || 'office';
            gameState.isComputerOn = parsedState.isComputerOn || false;
            gameState.hasReadEmail = parsedState.hasReadEmail || false;
            gameState.hasReadTerminal = parsedState.hasReadTerminal || false;
            gameState.hasViewedGallery = parsedState.hasViewedGallery || false;
            gameState.hasViewedTrash = parsedState.hasViewedTrash || false;
            gameState.doorUnlocked = parsedState.doorUnlocked || false;
            gameState.breakroomUnlocked = parsedState.breakroomUnlocked || false;
            gameState.hasInsertedKeycard = parsedState.hasInsertedKeycard || false;
            gameState.hasInsertedDevice = parsedState.hasInsertedDevice || false;
            gameState.doorCode = parsedState.doorCode || "";
            gameState.hintLevel = parsedState.hintLevel || 0;
            
            // 恢复已收集物品
            if (parsedState.collectedItems && Array.isArray(parsedState.collectedItems)) {
                parsedState.collectedItems.forEach(itemName => {
                    const item = findItemByName(itemName);
                    if (item) {
                        item.collected = true;
                    }
                });
            }
            
            // 恢复已揭示物品
            if (parsedState.revealedItems && Array.isArray(parsedState.revealedItems)) {
                parsedState.revealedItems.forEach(itemName => {
                    const item = findItemByName(itemName);
                    if (item) {
                        item.revealed = true;
                    }
                });
            }
            
            // 更新物品栏显示
            updateInventoryDisplay();
            
            console.log('游戏状态已加载');
        } catch (error) {
            console.error('加载游戏状态出错:', error);
        }
    }
    
    // 设置桌面图标点击事件
    function setupDesktopIcons() {
        // 获取所有热区元素
        const hotspots = document.querySelectorAll('.desktop-hotspot');
        
        // 为每个热区添加点击事件
        hotspots.forEach(hotspot => {
            // 移除之前的事件监听器（如果有）
            hotspot.removeEventListener('click', handleHotspotClick);
            // 添加新的事件监听器
            hotspot.addEventListener('click', handleHotspotClick);
        });
        
        // 热区点击处理函数
        function handleHotspotClick(e) {
            const iconName = this.dataset.name;
            
            switch (iconName) {
                case 'email':
                    // 显示邮件
                    showEmailScreen();
                    // 更新游戏状态
                    gameState.hasReadEmail = true;
                    saveGameState();
                    break;
                    
                case 'folder':
                    // 显示文件夹
                    showFolderScreen();
                    break;
                    
                case 'gallery':
                    // 显示照片查看器
                    showGallery();
                    break;
                    
                case 'trash':
                    // 显示垃圾箱
                    showTrash();
                    break;
                    
                case 'terminal':
                    // 显示终端
                    showTerminal();
                    break;
            }
        }
    }
    
    // 显示对话框
    function showDialog(text) {
        // 确保有内容才显示
        if (!text || text.trim() === '') {
            return; // 不显示空文本
        }
        
        const dialogBox = document.getElementById('dialog-box');
        dialogBox.textContent = text;
        dialogBox.style.display = 'block';
        
        // 5秒后自动隐藏
        setTimeout(() => {
            dialogBox.style.display = 'none';
        }, 5000);
    }
    
    // 显示电脑屏幕
    function showComputer() {
        document.getElementById('computer-screen').style.display = 'block';
        gameState.isComputerOn = true;
        
        // 重置密码输入框
        document.querySelectorAll('.password-digit').forEach(input => {
            input.value = '';
        });
        
        // 聚焦第一个输入框
        document.querySelector('.password-digit[data-index="0"]').focus();
        
        // 设置输入框事件
        setupPasswordInputs();
    }
    
    // 设置密码输入框事件
    function setupPasswordInputs() {
        const inputs = document.querySelectorAll('.password-digit');
        
        inputs.forEach((input, index) => {
            // 清除之前的事件监听器
            input.removeEventListener('input', handleInput);
            input.removeEventListener('keydown', handleKeyDown);
            
            // 添加新的事件监听器
            input.addEventListener('input', handleInput);
            input.addEventListener('keydown', handleKeyDown);
        });
        
        // 处理输入事件
        function handleInput(e) {
            const index = parseInt(e.target.dataset.index);
            
            // 只允许输入数字
            if (!/^\d*$/.test(e.target.value)) {
                e.target.value = e.target.value.replace(/\D/g, '');
                return;
            }
            
            // 如果输入了内容且不是最后一个输入框，则聚焦下一个
            if (e.target.value && index < 3) {
                const nextInput = document.querySelector(`.password-digit[data-index="${index + 1}"]`);
                nextInput.focus();
            }
        }
        
        // 处理按键事件
        function handleKeyDown(e) {
            const index = parseInt(e.target.dataset.index);
            
            // 处理退格键
            if (e.key === 'Backspace') {
                if (e.target.value === '' && index > 0) {
                    // 如果当前输入框为空且不是第一个，则聚焦上一个
                    const prevInput = document.querySelector(`.password-digit[data-index="${index - 1}"]`);
                    prevInput.focus();
                    // 可选：清空上一个输入框
                    // prevInput.value = '';
                }
            }
            
            // 处理左右箭头键
            if (e.key === 'ArrowLeft' && index > 0) {
                const prevInput = document.querySelector(`.password-digit[data-index="${index - 1}"]`);
                prevInput.focus();
            }
            if (e.key === 'ArrowRight' && index < 3) {
                const nextInput = document.querySelector(`.password-digit[data-index="${index + 1}"]`);
                nextInput.focus();
            }
        }
    }
    
    // 隐藏电脑屏幕
    function hideComputer() {
        document.getElementById('computer-screen').style.display = 'none';
        document.getElementById('computer-content').style.display = 'block';
        document.getElementById('computer-desktop').style.display = 'none';
        gameState.isComputerOn = false;
    }
    
    // 关闭电脑按钮
    document.getElementById('close-computer').addEventListener('click', hideComputer);
    
    // 点击对话框关闭
    document.getElementById('dialog-box').addEventListener('click', () => {
        document.getElementById('dialog-box').style.display = 'none';
    });
    
    // 添加物品栏点击事件
    function setupInventoryItems() {
        // 帮助按钮
        document.getElementById('help-slot').innerHTML = '<div class="inventory-item" id="help-icon">?</div>';
        document.getElementById('help-slot').addEventListener('click', () => {
            const helpMessage = labels.help;
            showDialog(helpMessage);
        });
        
        // 添加右键点击帮助按钮重置游戏功能
        document.getElementById('help-slot').addEventListener('contextmenu', (e) => {
            e.preventDefault(); // 阻止默认的右键菜单
            if (confirm('确定要重置游戏进度吗？这将清除所有已收集的物品和解谜进度。')) {
                localStorage.removeItem('lockedOfficeGameState');
                showDialog(labels.game_reset);
                setTimeout(() => {
                    location.reload(); // 刷新页面
                }, 2000);
            }
        });
    }
    
    // 电脑密码登录
    document.getElementById('login-button').addEventListener('click', () => {
        // 获取所有4位密码
        const inputs = document.querySelectorAll('.password-digit');
        let password = '';
        
        // 组合密码
        inputs.forEach(input => {
            password += input.value || '0'; // 未输入的用0代替
        });
        
        // 检查密码是否正确
        if (password === '1727') { // 新密码
            // 显示登录成功提示
            showDialog(labels.computer_login_success);
            
            // 延迟显示桌面
            setTimeout(() => {
                showDesktop();
                // 更新游戏状态
                gameState.hasReadEmail = false; // 重置状态，因为现在需要点击邮件图标才算读取邮件
                saveGameState();
            }, 1500);
        } else {
            // 检查labels.password_error是否存在
            const errorMessage = labels.password_error;
            showDialog(errorMessage);
            
            // 清空输入框并聚焦第一个
            inputs.forEach(input => {
                input.value = '';
            });
            inputs[0].focus();
        }
    });
    
    // 忘记密码提示点击事件
    document.querySelector('.login-help').addEventListener('click', () => {
        showDialog(labels.password_hint);
    });
    
    // 显示桌面
    function showDesktop() {
        // 隐藏登录界面
        document.getElementById('computer-content').style.display = 'none';
        // 显示桌面界面
        document.getElementById('computer-desktop').style.display = 'block';
        
        // 设置桌面图标点击事件
        setupDesktopIcons();
        
        // 设置桌面关闭按钮事件
        document.getElementById('desktop-close').addEventListener('click', hideComputer);
    }
    
    // 隐藏桌面
    function hideDesktop() {
        // 隐藏桌面界面
        document.getElementById('computer-desktop').style.display = 'none';
        // 显示内容区域（这样其他界面可以显示）
        document.getElementById('computer-content').style.display = 'block';
    }
    
    // 显示入职材料详细信息
    function showDocumentInfo() {
        document.getElementById('document-info').style.display = 'block';
        gameState.isDocumentOpen = true;
    }
    
    // 隐藏入职材料详细信息
    function hideDocumentInfo() {
        document.getElementById('document-info').style.display = 'none';
        gameState.isDocumentOpen = false;
    }
    
    // 添加关闭文档窗口事件
    document.getElementById('close-document').addEventListener('click', hideDocumentInfo);
    
    // 设置门禁面板事件
    function setupDoorPanel() {
        // 关闭按钮
        document.getElementById('close-door-panel').addEventListener('click', () => {
            hideDoorPanel();
        });
        
        // 添加数字按键事件
        document.querySelectorAll('.door-key').forEach(key => {
            key.addEventListener('click', () => {
                const digit = key.dataset.digit;
                updateDoorCodeDisplay(digit);
            });
        });
        
        // 解锁按钮
        document.getElementById('unlock-door').addEventListener('click', () => {
            tryUnlockDoor();
        });
        
        // 门禁卡槽点击事件
        document.getElementById('door-card-empty').addEventListener('click', () => {
            insertKeycard();
        });
    }
    
    // 显示门禁面板
    function showDoorPanel() {
        document.getElementById('door-panel').style.display = 'block';
        gameState.isDoorPanelOpen = true;
        
        // 更新门禁卡状态显示
        updateDoorCardDisplay();
        
        // 更新门禁密码显示
        document.getElementById('door-code-display').textContent = gameState.doorCode || '____';
    }
    
    // 隐藏门禁面板
    function hideDoorPanel() {
        document.getElementById('door-panel').style.display = 'none';
        gameState.isDoorPanelOpen = false;
    }
    
    // 更新门禁密码显示
    function updateDoorCodeDisplay(digit) {
        // 如果没有插入门禁卡和设备，不能输入密码
        if (!gameState.hasInsertedKeycard || !gameState.hasInsertedDevice) {
            showDialog("你需要先插入门禁卡和破解设备。");
            return;
        }
        
        // 更新密码
        if (gameState.doorCode.length < 4) {
            gameState.doorCode += digit;
        } else {
            // 如果已经有4位数字，替换最后一位
            gameState.doorCode = gameState.doorCode.substring(0, 3) + digit;
        }
        
        // 更新显示
        document.getElementById('door-code-display').textContent = gameState.doorCode;
    }
    
    // 尝试插入门禁卡
    function insertKeycard() {
        const keycard = findItemByName('keycard');
        const device = findItemByName('device');
        
        if (keycard.collected) {
            if (!gameState.hasInsertedKeycard) {
                gameState.hasInsertedKeycard = true;
                
                // 检查是否也有设备
                if (device.collected) {
                    gameState.hasInsertedDevice = true;
                    showDialog(labels.device_and_keycard_combined);
                } else {
                    showDialog(labels.need_keycard_with_device);
                }
                
                // 更新显示
                updateDoorCardDisplay();
            }
        } else {
            showDialog(labels.need_keycard);
        }
    }
    
    // 更新门禁卡显示
    function updateDoorCardDisplay() {
        const emptySlot = document.getElementById('door-card-empty');
        const insertedSlot = document.getElementById('door-card-inserted');
        
        if (gameState.hasInsertedKeycard) {
            emptySlot.style.display = 'none';
            insertedSlot.style.display = 'block';
        } else {
            emptySlot.style.display = 'block';
            insertedSlot.style.display = 'none';
        }
    }
    
    // 尝试解锁门
    function tryUnlockDoor() {
        // 检查是否插入了门禁卡和设备
        if (!gameState.hasInsertedKeycard || !gameState.hasInsertedDevice) {
            showDialog(labels.need_both_items);
            return;
        }
        
        // 检查密码长度
        if (gameState.doorCode.length < 4) {
            showDialog(labels.need_complete_code);
            return;
        }
        
        // 检查密码是否正确 - 根据提示，密码是"7734"的逆序，即"4377"
        if (gameState.doorCode === "4377") {
            // 正确密码
            showDialog(labels.door_unlocked);
            gameState.doorUnlocked = true;
            hideDoorPanel();
            
            // 保存游戏状态
            saveGameState();
            
            // 2秒后提示游戏胜利
            setTimeout(() => {
                alert("恭喜你，成功逃离了办公室！游戏结束。");
            }, 2000);
        } else {
            // 错误密码
            showDialog(labels.wrong_password);
            // 清空密码
            gameState.doorCode = "";
            document.getElementById('door-code-display').textContent = '____';
        }
    }
}); 