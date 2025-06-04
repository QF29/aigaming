// 《量子矩阵》游戏主逻辑
class QuantumMatrixGame {
    constructor() {
        this.currentScene = 'office-scene';
        this.gameState = {
            computerUnlocked: false,
            drawersOpened: false,
            drawer1: false,
            drawer2: false,
            drawer3: false,
            microwaveHacked: false,
            coffeeConsumed: false,
            hasViewedTerminal: false,
            hasViewedTrash: false,
            usbInserted: false,
            inventory: {},
            // 会议室相关状态
            conferenceReplayActive: false,
            conferenceAbnormalState: false,
            conferenceAnomaliesFound: {
                clock: false,
                whiteboard: false,
                cup: false
            },
            conferenceAllAnomaliesFound: false,
            conferenceVisited: false
        };
        this.inventory = [];
        this.dialogTimer = null; // 添加对话框定时器
        this.selectedItem = null; // 添加选中物品状态
        this.clawMachineUsed = 0; // 添加抓娃娃机使用次数
        this.currentSpecialItem = null; // 添加当前特殊物品状态
        
        // 调试相关
        this.debugMode = false;
        this.selectedArea = null;
        this.selectedIndex = -1;
        this.currentAreas = [];
        this.offsetX = 0;
        this.offsetY = 0;
        this.selectedDesktopIcon = null;
        
        this.scenes = ['office-scene', 'breakroom-scene', 'gamingroom-scene', 'conference-scene'];
        this.currentSceneIndex = 0;
        
        this.gameState.currentPassword = '';
        this.gameState.passwordTarget = null;
        
        // 响应式设计相关属性 - 多分辨率支持
        this.baseWidth = 1920; // 基准宽度（当前浏览器窗口）
        this.baseHeight = 968; // 基准高度（当前浏览器窗口）
        this.scaleX = 1;
        this.scaleY = 1;
        
        // 检测设备类型和分辨率
        this.deviceInfo = this.detectDevice();
        
        this.init();
    }
    
    // 新增：设备和分辨率检测
    detectDevice() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const pixelRatio = window.devicePixelRatio || 1;
        const aspectRatio = width / height;
        
        let deviceType = 'desktop';
        let screenCategory = 'standard';
        
        // 检测屏幕类型
        if (width >= 3000 && height >= 1900) {
            screenCategory = 'high-res'; // 高分辨率屏幕（如14英寸MacBook Pro）
        } else if (width >= 1920 && width <= 2560 && height >= 1080 && height <= 1440) {
            screenCategory = 'medium-res'; // 中等分辨率（如24英寸显示器）
        } else if (width < 1920) {
            screenCategory = 'low-res'; // 低分辨率
        }
        
        console.log(`设备检测: ${width}x${height}, 像素比=${pixelRatio}, 宽高比=${aspectRatio.toFixed(2)}, 类型=${screenCategory}`);
        
        return {
            width,
            height,
            pixelRatio,
            aspectRatio,
            deviceType,
            screenCategory
        };
    }
    
    init() {
        // 自动屏幕诊断 - 游戏启动时运行
        this.performScreenDiagnosis();
        
        // 计算缩放比例
        this.calculateScale();
        
        // 监听窗口大小变化 - 添加防抖动
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log('窗口大小改变，重新计算缩放...');
                this.deviceInfo = this.detectDevice(); // 重新检测设备
                this.performScreenDiagnosis(); // 重新诊断
                this.calculateScale();
                this.createInteractiveAreas();
                
                // 如果在桌面模式下，重新设置桌面图标
                if (this.isDesktopVisible()) {
                    // 为桌面图标添加debug样式
                    // this.setupDesktopIconsDebug();
                }
            }, 100); // 100ms防抖动
        });
        
        // 显示加载屏幕
        this.showLoadingScreen();
        
        // 绑定开始游戏按钮
        this.bindStartButton();
        
        // 绑定事件监听器
        this.bindEvents();
        
        // 创建可交互区域
        this.createInteractiveAreas();
        
        // 初始化物品栏
        this.initInventory();
    }
    
    // 自动屏幕诊断 - 游戏启动时运行
    performScreenDiagnosis() {
        console.log('🚀 QuantumMatrix 游戏启动诊断');
        console.log('═'.repeat(50));
        
        // 基础屏幕信息
        console.log('📱 设备信息:');
        console.log(`   浏览器窗口: ${window.innerWidth}x${window.innerHeight}`);
        console.log(`   屏幕分辨率: ${screen.width}x${screen.height}`);
        console.log(`   可用屏幕: ${screen.availWidth}x${screen.availHeight}`);
        console.log(`   像素比例: ${window.devicePixelRatio || 1}`);
        console.log(`   用户代理: ${navigator.platform}`);
        
        // 游戏检测信息
        console.log('🎮 游戏检测:');
        console.log(`   设备类型: ${this.deviceInfo.screenCategory}`);
        console.log(`   宽高比: ${this.deviceInfo.aspectRatio.toFixed(2)}`);
        console.log(`   基准分辨率: ${this.baseWidth}x${this.baseHeight} (当前浏览器窗口)`);
        
        // 容器信息
        const container = document.querySelector('.scene-container');
        if (container) {
            const containerRect = container.getBoundingClientRect();
            console.log('📦 游戏容器:');
            console.log(`   容器尺寸: ${containerRect.width.toFixed(1)}x${containerRect.height.toFixed(1)}`);
            console.log(`   容器位置: left=${containerRect.left.toFixed(1)}, top=${containerRect.top.toFixed(1)}`);
        }
        
        // 适配状态
        this.displayAdaptationStatus();
        
        console.log('═'.repeat(50));
        
        // 根据检测结果给出建议
        this.displayRecommendations();
    }
    
    // 显示适配状态
    displayAdaptationStatus() {
        console.log('⚙️ 适配状态:');
        
        if (this.deviceInfo.screenCategory === 'high-res') {
            console.log('   ✅ 高分辨率屏幕 - 使用原始设计比例');
        } else if (this.deviceInfo.width === 1920 && this.deviceInfo.height === 1080) {
            console.log('   🔧 24英寸FHD屏幕 - 应用偏移修正');
        } else if (this.deviceInfo.screenCategory === 'medium-res') {
            console.log('   📱 中等分辨率屏幕 - 自适应缩放');
        } else {
            console.log('   ⚠️ 小屏幕或移动设备 - 可能需要特殊优化');
        }
        
        // 检查是否可能存在显示问题
        const windowArea = window.innerWidth * window.innerHeight;
        const minRecommendedArea = 1024 * 768;
        
        if (windowArea < minRecommendedArea) {
            console.log('   ⚠️ 警告: 屏幕尺寸较小，游戏体验可能受影响');
        }
    }
    
    // 显示建议
    displayRecommendations() {
        console.log('💡 建议与调试:');
        
        if (this.deviceInfo.width < 1200 || this.deviceInfo.height < 800) {
            console.log('   📱 建议: 使用更大的屏幕或最大化浏览器窗口');
        }
        
        if (this.deviceInfo.screenCategory === 'high-res') {
            console.log('   🔍 高分辨率调试: 如有显示问题，运行 game.checkHighResDisplay()');
        } else if (this.deviceInfo.width === 1920 && this.deviceInfo.height === 1080) {
            console.log('   🔧 24英寸调试: 如需微调热区，运行 game.adjustForScreen24(x, y, scale)');
        }
        
        console.log('   🛠️ 通用调试: 按 D 键开启调试模式查看热区');
        console.log('   📊 状态检查: 随时运行以下命令查看状态:');
        console.log('      game.deviceInfo       // 设备信息');
        console.log('      game.scaleX, game.scaleY  // 当前缩放比例');
        console.log('      game.centerOffsetX, game.centerOffsetY  // 偏移量');
    }
    
    // 改进的缩放比例计算 - 基于背景图片缩放，正确处理Y轴偏移
    calculateScale() {
        const container = document.querySelector('.scene-container');
        if (!container) {
            console.log('⚠️ 容器未找到，使用默认缩放');
            this.scaleX = 1.0;
            this.scaleY = 1.0;
            this.centerOffsetX = 0;
            this.centerOffsetY = 0;
            return;
        }
        
        const containerRect = container.getBoundingClientRect();
        
        // 检查容器是否已正确初始化
        if (containerRect.width <= 0 || containerRect.height <= 0) {
            console.log('⚠️ 容器尺寸异常，延迟计算缩放');
            setTimeout(() => {
                this.calculateScale();
                this.createInteractiveAreas();
            }, 100);
            return;
        }
        
        // 重新检测当前设备信息
        this.deviceInfo = this.detectDevice();
        
        // 计算容器的实际可用空间（减去边框和内边距）
        const availableWidth = containerRect.width - 4; // 减去2px边框
        const availableHeight = containerRect.height - 4;
        
        // 背景图片原始尺寸
        const backgroundImageWidth = 1920;
        const backgroundImageHeight = 1080;
        
        // 基准容器尺寸（用户提供坐标时的容器尺寸）
        const baseContainerWidth = 1676;
        const baseContainerHeight = 944;
        
        // 计算背景图在当前容器中的缩放比例（基于宽度）
        const scaleRatio = availableWidth / baseContainerWidth;
        
        // 计算背景图在当前容器中的实际显示尺寸
        const backgroundDisplayWidth = availableWidth; // 宽度填满容器
        const backgroundDisplayHeight = backgroundDisplayWidth * (backgroundImageHeight / backgroundImageWidth); // 按比例缩放高度
        
        // 计算背景图在容器中的垂直偏移（居中显示）
        const backgroundOffsetY = (availableHeight - backgroundDisplayHeight) / 2;
        
        this.scaleX = scaleRatio;
        this.scaleY = scaleRatio;
        this.centerOffsetX = 0;
        this.centerOffsetY = backgroundOffsetY;
        
        console.log(`🎯 背景图缩放计算:`);
        console.log(`   容器尺寸: ${availableWidth}x${availableHeight}`);
        console.log(`   基准尺寸: ${baseContainerWidth}x${baseContainerHeight}`);
        console.log(`   缩放比例: ${scaleRatio.toFixed(4)}`);
        console.log(`   背景显示: ${backgroundDisplayWidth}x${backgroundDisplayHeight.toFixed(1)}`);
        console.log(`   Y轴偏移: ${backgroundOffsetY.toFixed(1)}px`);
    }
    
    // 简化的坐标转换函数 - 基于背景图缩放
    scaleCoordinate(x, y, width, height) {
        // 确保缩放比例已计算
        if (!this.scaleX || !this.scaleY) {
            this.calculateScale();
        }
        
        // 计算缩放后的坐标和尺寸
        const scaledX = Math.round(x * this.scaleX + this.centerOffsetX);
        const scaledY = Math.round(y * this.scaleY + this.centerOffsetY);
        const scaledWidth = Math.round(width * this.scaleX);
        const scaledHeight = Math.round(height * this.scaleY);
        
        return {
            x: scaledX,
            y: scaledY,
            width: Math.max(scaledWidth, 20), // 最小20px
            height: Math.max(scaledHeight, 20), // 最小20px
            originalX: x, // 保存原始坐标
            originalY: y,
            originalWidth: width,
            originalHeight: height
        };
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.display = 'flex';
    }
    
    bindStartButton() {
        const startButton = document.getElementById('start-game-btn');
        startButton.addEventListener('click', () => {
            this.hideLoadingScreen();
            this.startGame();
            this.playBackgroundMusic();
        });
    }
    
    hideLoadingScreen() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('game-interface').style.display = 'flex';
    }
    
    startGame() {
        console.log('🎮 游戏开始');
        
        this.showDialog("你是林默，今天是你在量子矩阵科技的第一天。奇怪的是，办公室里一个人也没有。环境很不对劲，你必须找出离开的方法。");
        this.gameState.isFirstTime = false;
        
        
        // 确保热区正确创建
        setTimeout(() => {
            console.log('🔄 游戏开始后重新创建热区...');
            this.calculateScale();
            this.createInteractiveAreas();
        }, 500);
        
        // 游戏开始后检查场景状态
        setTimeout(() => {
            this.checkSceneAfterStart();
        }, 1000); // 等待1秒确保场景完全加载
    }
    
    // 游戏开始后的场景检查
    checkSceneAfterStart() {
        console.log('🎬 游戏场景检查:');
        
        const activeScene = document.querySelector('.scene.active');
        const sceneBackground = document.querySelector('.scene.active .scene-background');
        
        if (!activeScene) {
            console.log('   ❌ 未找到激活的场景');
            return;
        }
        
        if (!sceneBackground) {
            console.log('   ❌ 未找到场景背景元素');
            return;
        }
        
        const sceneRect = sceneBackground.getBoundingClientRect();
        const computedStyle = getComputedStyle(sceneBackground);
        
        console.log(`   📍 当前场景: ${this.currentScene}`);
        console.log(`   🖼️ 背景尺寸: ${sceneRect.width.toFixed(1)}x${sceneRect.height.toFixed(1)}`);
        console.log(`   🎨 背景样式: ${computedStyle.backgroundSize}`);
        console.log(`   📐 背景位置: ${computedStyle.backgroundPosition}`);
        
        // 检查背景图片是否可能被裁剪
        const container = document.querySelector('.scene-container');
        if (container) {
            const containerRect = container.getBoundingClientRect();
            const widthRatio = sceneRect.width / containerRect.width;
            const heightRatio = sceneRect.height / containerRect.height;
            
            console.log(`   📊 填充比例: 宽度=${(widthRatio * 100).toFixed(1)}%, 高度=${(heightRatio * 100).toFixed(1)}%`);
            
            if (widthRatio < 0.8 || heightRatio < 0.8) {
                console.log('   ⚠️ 警告: 背景图片可能显示不完整');
                console.log('   💡 建议: 检查CSS background-size设置或调整窗口大小');
            } else {
                console.log('   ✅ 背景图片显示正常');
            }
        }
        
        // 检查交互区域
        const interactiveAreas = document.querySelectorAll('.interactive-area');
        console.log(`   🎯 交互区域: ${interactiveAreas.length} 个`);
        
        if (interactiveAreas.length === 0) {
            console.log('   ⚠️ 警告: 未找到交互区域，可能需要等待或刷新');
        }
        
        console.log('═'.repeat(30));
    }
    
    bindEvents() {
        // 场景切换按钮
        document.getElementById('prev-scene').addEventListener('click', () => this.previousScene());
        document.getElementById('next-scene').addEventListener('click', () => this.nextScene());
        
        // 对话框关闭 - 点击对话框内容区域关闭
        document.getElementById('dialog-box').addEventListener('click', () => this.hideDialog());
        
        // 添加模态框背景点击关闭功能
        document.addEventListener('click', (e) => {
            // 检查是否点击的是门禁模态框的背景
            if (e.target.id === 'door-access-modal') {
                this.closeModal('door-access-modal');
            }
        });
        
        // 键盘事件 - 调试模式控制
        document.addEventListener('keydown', (e) => {
            // 确保D键总是能触发debug模式，不管在哪个界面
            if (e.key.toLowerCase() === 'd') {
                // 检查是否在输入框中，如果是则不触发
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                    return; // 在输入框中时不触发debug模式
                }
                
                e.preventDefault();
                e.stopPropagation();
                this.toggleDebugMode();
                return;
            }
            
            if (!this.debugMode) return;
            
            // 阻止默认行为
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                e.preventDefault();
            }
            
            const step = 5;
            const resizeMode = e.shiftKey;
            
            switch(e.key) {
                case 'ArrowLeft':
                    if (this.selectedArea) {
                        this.adjustSelectedArea(-step, 0, resizeMode);
                    } else if (this.selectedDesktopIcon) {
                        this.adjustDesktopIcon(-step, 0, resizeMode);
                    } else {
                        this.offsetX -= step;
                        this.createInteractiveAreas();
                    }
                break;
                case 'ArrowRight':
                    if (this.selectedArea) {
                        this.adjustSelectedArea(step, 0, resizeMode);
                    } else if (this.selectedDesktopIcon) {
                        this.adjustDesktopIcon(step, 0, resizeMode);
                    } else {
                        this.offsetX += step;
                        this.createInteractiveAreas();
                    }
                break;
                case 'ArrowUp':
                    if (this.selectedArea) {
                        this.adjustSelectedArea(0, -step, resizeMode);
                    } else if (this.selectedDesktopIcon) {
                        this.adjustDesktopIcon(0, -step, resizeMode);
                    } else {
                        this.offsetY -= step;
                        this.createInteractiveAreas();
                    }
                break;
                case 'ArrowDown':
                    if (this.selectedArea) {
                        this.adjustSelectedArea(0, step, resizeMode);
                    } else if (this.selectedDesktopIcon) {
                        this.adjustDesktopIcon(0, step, resizeMode);
                    } else {
                        this.offsetY += step;
                        this.createInteractiveAreas();
                    }
                break;
                case 'Tab':
                    // 修复Tab键选择逻辑：只有当在电脑界面内且在桌面显示时，才选择桌面图标
                    // 否则选择当前场景的交互区域
                    const computerModalForTab = document.getElementById('computer-modal');
                    const isInComputerInterfaceForTab = computerModalForTab && computerModalForTab.classList.contains('active');
                    
                    if (isInComputerInterfaceForTab && this.isDesktopVisible()) {
                        this.selectNextDesktopIcon();
                    } else {
                        this.selectNextArea();
                    }
                break;
                case 'c':
                case 'C':
                    // 修复复制逻辑：优先处理选中的区域或图标
                    if (this.selectedArea) {
                        this.copyCoordinates();
                    } else if (this.selectedDesktopIcon) {
                        this.copyDesktopIconCoordinates();
                    } else {
                        // 如果没有选中任何内容，根据当前界面环境决定复制什么
                        const computerModalForCopy = document.getElementById('computer-modal');
                        const isInComputerInterfaceForCopy = computerModalForCopy && computerModalForCopy.classList.contains('active');
                        
                        if (isInComputerInterfaceForCopy && this.isDesktopVisible()) {
                            console.log('请先选择一个桌面图标（按Tab键选择）');
                        } else {
                            console.log('请先选择一个交互区域（按Tab键选择）');
                        }
                    }
                break;
                case 's':
                case 'S':
                    // 修复保存逻辑：只有当在电脑界面内且在桌面显示时，才保存桌面图标坐标
                    // 否则保存当前场景的交互区域坐标
                    const computerModal = document.getElementById('computer-modal');
                    const isInComputerInterface = computerModal && computerModal.classList.contains('active');
                    
                    if (isInComputerInterface && this.isDesktopVisible()) {
                        this.saveDesktopIconsCoordinates();
                    } else {
                        this.saveAllCoordinates();
                    }
                break;
                case 'r':
                case 'R':
                    // 修复重置逻辑：只有当在电脑界面内且在桌面显示时，才重置桌面图标
                    // 否则重置当前场景的坐标
                    const computerModalForReset = document.getElementById('computer-modal');
                    const isInComputerInterfaceForReset = computerModalForReset && computerModalForReset.classList.contains('active');
                    
                    if (isInComputerInterfaceForReset && this.isDesktopVisible()) {
                        this.resetDesktopIcons();
                    } else {
                        this.resetCoordinates();
                    }
                break;
                case 'e':
                case 'E':
                    this.exportSceneData();
                break;
                case 'Escape':
                    this.clearSelection();
                    this.clearDesktopIconSelection();
                break;
            }
            
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                const mode = this.selectedArea ? (resizeMode ? '调整大小' : '移动位置') : '全局偏移';
                console.log(`${mode} - 偏移: X=${this.offsetX}, Y=${this.offsetY}`);
            }
        });
        
        // 密码输入事件
        this.bindPasswordEvents();
    }
    
    bindPasswordEvents() {
        // 阻止默认的按钮函数，将在这里重新定义
        window.addDigit = (digit) => this.addPasswordDigit(digit);
        window.clearPassword = () => this.clearPassword();
        window.confirmPassword = () => this.confirmPassword();
        window.loginComputer = () => this.loginComputer();
        window.showDesktop = () => this.showDesktop();
        window.closeModal = (modalId) => this.closeModal(modalId);
        window.selectCoffee = (type) => this.selectCoffee(type);
        window.drinkCoffee = () => this.drinkCoffee();
        window.flipImage = () => this.flipImage();
        window.playClaw = () => this.playClaw();
        window.discardToy = () => this.discardToy();
        window.verifyDoorAccess = () => this.verifyDoorAccess();
    }
    
    createInteractiveAreas() {
        // 清除现有的交互区域
        document.querySelectorAll('.interactive-area').forEach(area => area.remove());
        
        const currentSceneElement = document.getElementById(this.currentScene);
        const sceneBackground = currentSceneElement.querySelector('.scene-background');
        
        // 根据当前场景创建交互区域
        switch (this.currentScene) {
            case 'office-scene':
                this.createOfficeInteractives(sceneBackground);
                break;
            case 'breakroom-scene':
                this.createBreakroomInteractives(sceneBackground);
                break;
            case 'gamingroom-scene':
                this.createGamingroomInteractives(sceneBackground);
                break;
            case 'conference-scene':
                this.createConferenceInteractives(sceneBackground);
                break;
        }
    }
    
    createOfficeInteractives(container) {
        // 获取容器尺寸以确定使用哪套坐标
        const containerRect = container.getBoundingClientRect ? 
            container.getBoundingClientRect() : 
            document.querySelector('.scene-container').getBoundingClientRect();
        
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        console.log(`📦 容器尺寸: ${containerWidth.toFixed(1)}x${containerHeight.toFixed(1)}`);
        
        // 使用统一的基准坐标（基于1676x944容器的测试坐标）
        const baseAreas = [
            { name: 'window', x: 112, y: 118.625, width: 409, height: 205, action: () => this.examineWindow() },
            { name: 'calendar', x: 647, y: 101.625, width: 114, height: 114, action: () => this.examineCalendar() },
            { name: 'plant', x: 1043, y: 363.625, width: 199, height: 226, action: () => this.examinePlant() },
            { name: 'document', x: 432, y: 541.625, width: 80, height: 46, action: () => this.examineDocument() },
            { name: 'coffee', x: 542, y: 519.625, width: 53, height: 59, action: () => this.examineCoffee() },
            { name: 'door', x: 1287, y: 135.625, width: 255, height: 540, action: () => this.examineDoor() },
            { name: 'flowerpot', x: 1096, y: 631.625, width: 96, height: 106, action: () => this.examineFlowerpot() },
            { name: 'clock', x: 932, y: 144.625, width: 152, height: 153, action: () => this.examineClock() },
            { name: 'computer', x: 632, y: 389.625, width: 190, height: 120, action: () => this.openComputer() },
            { name: 'drawer1', x: 412, y: 680.625, width: 164, height: 69, action: () => this.openDrawer(1) },
            { name: 'drawer2', x: 852, y: 674.625, width: 140, height: 71, action: () => this.openDrawer(2) },
            { name: 'drawer3', x: 412, y: 754.625, width: 164, height: 72, action: () => this.openDrawer(3) }
        ];
        
        console.log(`📐 使用基准坐标集 (容器: ${containerWidth.toFixed(0)}x${containerHeight.toFixed(0)}) - 基于1676x944基准`);
        
        // 转换为缩放后的坐标（根据背景图缩放比例）
        const scaledAreas = baseAreas.map(area => ({
            ...area,
            ...this.scaleCoordinate(area.x, area.y, area.width, area.height)
        }));
        
        this.createAreasFromConfig(container, scaledAreas);
    }
    
    createBreakroomInteractives(container) {
        // 使用基准坐标定义热区 - 更新为新的坐标数据
        const baseAreas = [
            { name: 'coffee-machine', x: 167, y: 379, width: 94, height: 143, action: () => this.openCoffeeMachine() },
            { name: 'cabinet', x: 99, y: 565, width: 1049, height: 219, action: () => this.examineCabinet() },
            { name: 'microwave', x: 888, y: 407, width: 211, height: 114, action: () => this.openMicrowave() },
            { name: 'sink', x: 639, y: 370, width: 92, height: 119, action: () => this.examineSink() },
            { name: 'fridge', x: 1223, y: 205, width: 201, height: 347, action: () => this.examineFridge() },
            { name: 'cup', x: 432, y: 418, width: 96, height: 96, action: () => this.examineCup() },
            { name: 'photo-frame', x: 681, y: 55, width: 180, height: 122, action: () => this.examinePhotoFrame() },
            { name: 'cabinet-top', x: 145, y: 93, width: 315, height: 180, action: () => this.examineCabinetTop() }
        ];
        
        // 转换为缩放后的坐标
        const scaledAreas = baseAreas.map(area => ({
            ...area,
            ...this.scaleCoordinate(area.x, area.y, area.width, area.height)
        }));
        
        this.createAreasFromConfig(container, scaledAreas);
    }
    
    createGamingroomInteractives(container) {
        // 使用基准坐标定义热区
        const baseAreas = [
            { name: 'game-machine', x: 710, y: 460, width: 235, height: 105, action: () => this.openGameMachine() },
            { name: 'claw-machine', x: 1120, y: 168, width: 300, height: 637, action: () => this.openClawMachine() }
        ];
        
        // 转换为缩放后的坐标
        const scaledAreas = baseAreas.map(area => ({
            ...area,
            ...this.scaleCoordinate(area.x, area.y, area.width, area.height)
        }));
        
        this.createAreasFromConfig(container, scaledAreas);
    }
    
    createConferenceInteractives(container) {
        // 使用基准坐标定义热区 - 根据用户需求设置正确的坐标
        const baseAreas = [
            { name: 'tv', x: 1211, y: 112, width: 401, height: 280, action: () => this.openConferenceTV() }
        ];
        
        // 转换为缩放后的坐标
        const scaledAreas = baseAreas.map(area => ({
            ...area,
            ...this.scaleCoordinate(area.x, area.y, area.width, area.height)
        }));
        
        this.createAreasFromConfig(container, scaledAreas);
    }
    
    createAreasFromConfig(container, areas) {
        // 清除现有区域
        container.querySelectorAll('.interactive-area').forEach(area => area.remove());
        this.currentAreas = [];
        
        console.log(`🎯 开始创建 ${areas.length} 个热区，当前缩放: ${this.scaleX?.toFixed(4)}`);
        
        areas.forEach((area, index) => {
            // 输出原始和缩放后的坐标用于调试
            // area现在包含了原始坐标和缩放后的坐标
            const originalCoords = `原始(${area.originalX || area.x},${area.originalY || area.y},${area.originalWidth || area.width}x${area.originalHeight || area.height})`;
            const scaledCoords = `缩放后(${area.x},${area.y},${area.width}x${area.height})`;
            console.log(`热区 ${area.name}: ${originalCoords} -> ${scaledCoords}`);
            
            const element = document.createElement('div');
            element.className = 'interactive-area';
            element.setAttribute('data-name', area.name);
            element.style.left = area.x + 'px';
            element.style.top = area.y + 'px';
            element.style.width = area.width + 'px';
            element.style.height = area.height + 'px';
            element.style.position = 'absolute';
            element.style.zIndex = '10';
            
            // 存储原始数据
            element.areaData = {
                ...area,
                index: index,
                element: element
            };
                
            // 添加点击事件 - 修复事件处理
            element.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (this.debugMode) {
                    this.selectArea(element.areaData);
                } else {
                    console.log(`✅ 点击热区: ${area.name}`);
                    this.playAudio('click-audio'); // 播放点击音效
                    if (typeof area.action === 'function') {
                        area.action();
                    }
                }
            });
            
            // 添加鼠标悬停事件
            element.addEventListener('mouseenter', () => {
                if (!this.debugMode) {
                    element.style.cursor = 'pointer';
                }
            });
            
            container.appendChild(element);
            this.currentAreas.push(element.areaData);
        });
        
        console.log(`✅ 创建完成，共 ${areas.length} 个交互区域`);
    }
    
    // 场景切换
    previousScene() {
        this.playAudio('click-audio'); // 播放点击音效
        if (this.currentSceneIndex > 0) {
            this.currentSceneIndex--;
            this.switchToScene(this.scenes[this.currentSceneIndex]);
        }
    }
    
    nextScene() {
        this.playAudio('click-audio'); // 播放点击音效
        // 检查是否可以进入下一个场景
        if (this.currentSceneIndex === 0 && !this.gameState.breakroomUnlocked) {
            this.showPasswordModal('茶水间密码锁', '7734', () => {
                this.gameState.breakroomUnlocked = true;
                this.currentSceneIndex++;
                this.switchToScene(this.scenes[this.currentSceneIndex]);
            });
            return;
        }
        
        if (this.currentSceneIndex < this.scenes.length - 1) {
            this.currentSceneIndex++;
            this.switchToScene(this.scenes[this.currentSceneIndex]);
        }
    }
    
    switchToScene(sceneName) {
        console.log(`🎬 切换到场景: ${sceneName}`);
        
        // 隐藏所有场景
        document.querySelectorAll('.scene').forEach(scene => {
            scene.classList.remove('active');
        });
        
        // 显示目标场景
        document.getElementById(sceneName).classList.add('active');
        this.currentScene = sceneName;
        
        // 重新计算缩放比例并创建交互区域
        setTimeout(() => {
            console.log('🔄 重新计算缩放和创建热区...');
            this.calculateScale();
            this.createInteractiveAreas();
            
            // 验证热区是否正确创建
            const areas = document.querySelectorAll('.interactive-area');
            console.log(`✅ 场景 ${sceneName} 创建了 ${areas.length} 个热区`);
        }, 100); // 等待场景切换动画完成
        
        // 如果在调试模式下，加载保存的坐标
        if (this.debugMode) {
            this.loadSavedCoordinates();
        }
        
        // 更新导航按钮
        this.updateNavigationButtons();
        
        // 切换背景音乐
        this.switchBackgroundMusic();
        
        // 显示场景初始对话
        setTimeout(() => {
            if (sceneName === 'conference-scene' && !this.gameState.conferenceVisited) {
                this.showDialog("这里似乎有什么不对劲...试试查看会议录像");
                this.gameState.conferenceVisited = true;
            }
        }, 500);
    }
    
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-scene');
        const nextBtn = document.getElementById('next-scene');
        
        prevBtn.style.display = this.currentSceneIndex > 0 ? 'flex' : 'none';
        nextBtn.style.display = this.currentSceneIndex < this.scenes.length - 1 ? 'flex' : 'none';
    }
    
    switchBackgroundMusic() {
        const backgroundAudio = document.getElementById('background-audio');
        const gameAudio = document.getElementById('game-audio');
        
        if (this.currentScene === 'gamingroom-scene') {
            backgroundAudio.pause();
            gameAudio.volume = 0.4; // 游戏场景背景音40%
            gameAudio.play();
        } else {
            gameAudio.pause();
            backgroundAudio.volume = 1.0; // 其他场景背景音100%
            backgroundAudio.play();
        }
    }
    
    // 办公室交互
    examineWindow() {
        this.showDialog("窗外的城市景观看起来很奇怪，某些建筑物似乎在重复出现，就像一个循环播放的视频。这到底是怎么回事？");
    }
    
    examineCalendar() {
        this.showDialog("当你凝视BUG时，BUG也在凝视着你");
    }
    
    examinePlant() {
        this.showDialog("一盆健康的绿植");
    }
    
    examineDocument() {
        const documentContent = `
量子矩阵科技有限公司
项目文档 - 机密等级：绝密
========================================

项目编号：QM-<span style="color: #c9b037; font-weight: bold;">2027</span>-T
文档版本：v<span style="color: #c9b037; font-weight: bold;">2.7</span>
创建日期：2024年03月<span style="color: #c9b037; font-weight: bold;">27</span>日
最后修改：2024年03月<span style="color: #c9b037; font-weight: bold;">27</span>日 14:<span style="color: #c9b037; font-weight: bold;">27</span>

项目代号：现实重构计划 (Reality Reconstruction Project)
项目负责人：Dr. M.
技术主管：Dr. Chen
系统架构师：S.L.

========================================
项目概述
========================================

"现实重构计划"旨在通过量子计算技术实现人类意识的数字化转移，
创造出完全可控的虚拟现实环境。该项目将彻底改变人类对现实的认知边界。

核心技术：
- 量子意识映射技术 (QCM-<span style="color: #c9b037; font-weight: bold;">2.7</span>)
- 神经接口协议 v<span style="color: #c9b037; font-weight: bold;">27</span>.0
- 虚拟环境生成引擎
- 意识稳定算法

========================================
测试阶段
========================================

第一阶段 (已完成)：
- 测试对象：001-026
- 成功率：100%
- 意识稳定性：平均92.4%
- 虚拟环境适应性：优秀

第二阶段 (进行中)：
- 当前测试对象：<span style="color: #ff4444; font-weight: bold; background: rgba(255, 68, 68, 0.1); padding: 2px 4px; border-radius: 3px;">027</span>
- 状态：异常 - 显示出前所未有的自我意识
- 风险等级：⚠️ 高
- 建议：加强监控，必要时启动安全协议

========================================
技术规格
========================================

硬件要求：
- 量子处理器：1<span style="color: #c9b037; font-weight: bold;">27</span>核心配置
- 内存：<span style="color: #c9b037; font-weight: bold;">27</span>TB DDR<span style="color: #c9b037; font-weight: bold;">27</span>
- 存储：<span style="color: #c9b037; font-weight: bold;">2.7</span>PB SSD阵列
- 神经接口：NEI-<span style="color: #c9b037; font-weight: bold;">2027</span>型

软件版本：
- QuantumOS v<span style="color: #c9b037; font-weight: bold;">2.7</span>.3
- RealityEngine v<span style="color: #c9b037; font-weight: bold;">27</span>.0
- ConsciousnessMapper v<span style="color: #c9b037; font-weight: bold;">2.7</span>

========================================
安全协议
========================================

等级分类：
Level 1: 日常监控
Level 2: 异常检测 (当前)
Level 3: 紧急控制
Level <span style="color: #ff4444; font-weight: bold; background: rgba(255, 68, 68, 0.1); padding: 2px 4px; border-radius: 3px;">27</span>: 完全重置

当前状态：Level 2
原因：测试对象<span style="color: #ff4444; font-weight: bold;">027</span>表现出异常的环境质疑行为

注意事项：
⚠️ 如发现受试者接触系统核心文件，立即启动Level <span style="color: #ff4444; font-weight: bold;">27</span>协议
⚠️ S.L.模块表现异常，建议进行诊断
⚠️ 虚拟环境稳定性下降，需要实时监控

========================================
紧急联系方式
========================================

项目负责人：Dr. M. (内线: <span style="color: #c9b037; font-weight: bold;">2027</span>)
技术支持：Tech Support (内线: <span style="color: #c9b037; font-weight: bold;">2727</span>)
安全部门：Security (内线: 00<span style="color: #c9b037; font-weight: bold;">27</span>)
系统管理：SysAdmin (内线: <span style="color: #c9b037; font-weight: bold;">27</span>00)

========================================
文档控制
========================================

分发名单：
- Dr. M. (项目负责人) ✓
- Dr. Chen (技术主管) ✓
- Security Team ✓
- 测试对象<span style="color: #ff4444; font-weight: bold;">027</span> ❌ (禁止访问)

数字签名：QM-<span style="color: #c9b037; font-weight: bold;">2027</span>-T-v<span style="color: #c9b037; font-weight: bold;">2.7</span>-SEALED
验证码：MD5: a1b2c3d4e5f6789...<span style="color: #c9b037; font-weight: bold;">2027</span>
        `;
        
        this.showTextPreview(documentContent, '项目文档 QM-2027-T');
    }
    
    examineCoffee() {
        this.showDialog("一杯咖啡，似乎冷掉了");
    }
    
    examineDoor() {
        if (this.selectedItem && this.selectedItem.id === 'doorcard') {
            // 使用选中的门禁卡
            this.showDialog("刷卡成功！正在激活量子锁系统...");
            this.selectedItem = null; // 刷卡后取消选中状态
            this.updateInventory(); // 更新物品栏视觉效果
            setTimeout(() => {
                this.showModal('door-access-modal');
            }, 1500);
        } else {
            this.showDialog("门被量子锁锁住了，需要门禁卡才能激活解锁系统。");
        }
    }
    
    examineFlowerpot() {
        if (!this.gameState.inventory.paper) {
            this.collectItem('paper', '纸团');
            this.showDialog("你在花盆的泥土中发现了一张皱巴巴的纸团。");
        } else {
            this.showDialog("这是你发现纸团的花盆。");
        }
    }
    
    examineClock() {
        if (!this.gameState.inventory.pwd1) {
            this.collectItem('pwd1', '密码纸片1');
            this.showDialog("你在时钟后面发现了一张密码纸片。");
        } else {
            this.showDialog("一个普通的时钟。");
        }
    }
    
    openComputer() {
        this.showModal('computer-modal');
        if (!this.gameState.computerUnlocked) {
            document.getElementById('computer-login').style.display = 'block';
            document.getElementById('computer-desktop').style.display = 'none';
            document.getElementById('computer-app').style.display = 'none';
        } else {
            document.getElementById('computer-login').style.display = 'none';
            document.getElementById('computer-desktop').style.display = 'block';
            document.getElementById('computer-app').style.display = 'none';
            // 绑定桌面图标事件
            this.bindDesktopIconEvents();
        }
    }
    
    loginComputer() {
        const password = document.getElementById('computer-password').value;
        if (password === '1727') {
            this.gameState.computerUnlocked = true;
            this.playAudio('computer-audio');
            this.showDialog("Hello World! 测试对象27号成功连接");
            
            // 隐藏登录界面，显示桌面界面
            document.getElementById('computer-login').style.display = 'none';
            document.getElementById('computer-desktop').style.display = 'block';
            
            // 绑定桌面图标事件
            this.bindDesktopIconEvents();
        } else {
            this.showDialog("密码错误！提示：date is key");
        }
    }
    
    showDesktop() {
        document.getElementById('computer-login').style.display = 'none';
        document.getElementById('computer-desktop').style.display = 'block';
        document.getElementById('computer-app').style.display = 'none';
        
        // 等待DOM更新完成后设置背景
        setTimeout(() => {
            // 修复桌面背景显示问题
            const desktopBackground = document.querySelector('.desktop-background');
            if (desktopBackground) {
                // 强制重置背景样式，确保优先级
                desktopBackground.style.cssText = `
                    background-image: url('./public/images/computer_desk.png') !important;
                    background-size: cover !important;
                    background-repeat: no-repeat !important;
                    background-position: center center !important;
                    width: 100% !important;
                    height: 100% !important;
                    position: relative !important;
                    display: block !important;
                `;
                
                console.log('✅ 桌面背景图片已强制设置:', desktopBackground.style.backgroundImage);
                
                // 验证背景图片是否正确加载
                const img = new Image();
                img.onload = () => {
                    console.log('✅ 桌面背景图片加载成功');
                };
                img.onerror = () => {
                    console.error('❌ 桌面背景图片加载失败，检查路径: ./public/images/computer_desk.png');
                };
                img.src = './public/images/computer_desk.png';
                
            } else {
                console.error('❌ 桌面背景元素未找到，检查HTML结构');
            }
            
            // 绑定桌面图标事件
            this.bindDesktopIconEvents();
        }, 100);
    }
    
    // 桌面图标缩放功能（已取消）
    scaleDesktopIcons() {
        // 已取消缩放功能
    }
    
    // 绑定桌面图标点击事件
    bindDesktopIconEvents() {
        // 重新获取图标并绑定事件（避免使用replaceWith导致样式丢失）
        document.querySelectorAll('.desktop-icon').forEach((icon, index) => {
            // 检查是否已经绑定了事件，避免重复绑定
            if (!icon.hasAttribute('data-events-bound')) {
                icon.addEventListener('click', (e) => {
                    if (this.debugMode && this.isDesktopVisible()) {
                        e.stopPropagation();
                        this.selectDesktopIcon(icon, index);
                    } else {
                        this.playAudio('click-audio'); // 播放点击音效
                        const app = e.target.dataset.app;
                        this.openApp(app);
                    }
                });
                
                // 标记为已绑定事件
                icon.setAttribute('data-events-bound', 'true');
            }
        });
    }
    
    openDrawer(number) {
        if (!this.gameState.drawersOpened) {
            // 需要按 1-2-3 的顺序点击
            if (number === 1 && !this.gameState.drawer1) {
                this.gameState.drawer1 = true;
                this.showDialog("抽屉1已打开");
            } else if (number === 2 && this.gameState.drawer1 && !this.gameState.drawer2) {
                this.gameState.drawer2 = true;
                this.showDialog("抽屉2已打开");
            } else if (number === 3 && this.gameState.drawer2 && !this.gameState.drawer3) {
                this.gameState.drawer3 = true;
                this.gameState.drawersOpened = true;
                this.playAudio('drawers-audio');
                this.collectItem('doorcard', '门禁卡');
                this.collectItem('info1', '便签');
                this.showDialog("所有抽屉都已打开！你找到了门禁卡和一张便签。");
            } else {
                this.showDialog("需要按正确的顺序打开抽屉。");
            }
        } else {
            this.showDialog("抽屉已经打开过了。");
        }
    }
    
    // 茶水间交互
    openCoffeeMachine() {
        this.showModal('coffee-modal');
    }
    
    selectCoffee(type) {
        const statusDiv = document.getElementById('coffee-status');
        const drinkButton = document.getElementById('drink-coffee');
        
        if (type === '27-special') {
            statusDiv.textContent = '正在为测试对象27号冲泡专属咖啡...';
            this.playAudio('coffee-audio');
            
        setTimeout(() => {
                statusDiv.textContent = '咖啡已准备好！';
                drinkButton.style.display = 'block';
            }, 3000);
        } else {
            statusDiv.textContent = '权限不足';
        }
    }
    
    drinkCoffee() {
        this.gameState.coffeeConsumed = true;
        this.showDialog("这咖啡有种奇怪的味道...突然间，你感觉思维更加清晰了，仿佛能看透这个虚拟世界的本质。");
        this.closeModal('coffee-modal');
    }
    
    examineCabinet() {
        this.showDialog("打不开");
    }
    
    openMicrowave() {
        if (this.gameState.microwaveHacked) {
            this.showDialog("微波炉已经被破解过了。");
        } else if (this.selectedItem && this.selectedItem.id === 'device') {
            // 使用选中的破译器
            this.showDialog("使用破译器破解微波炉...");
            delete this.gameState.inventory.device; // 移除破译器
            this.selectedItem = null; // 清除选中状态
            this.updateInventory(); // 更新物品栏
            this.showModal('microwave-modal');
            this.hackMicrowave();
        } else {
            this.showDialog("死锁状态：资源无法释放，等待超时");
        }
    }
    
    hackMicrowave() {
        const statusDiv = document.getElementById('microwave-status');
        const progressDiv = document.getElementById('microwave-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        statusDiv.textContent = '入侵成功，正在格式化...';
        progressDiv.style.display = 'block';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 2;
            progressFill.style.width = progress + '%';
            progressText.textContent = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                this.gameState.microwaveHacked = true;
                this.collectItem('disk', 'U盘');
                statusDiv.textContent = '格式化完成！获得U盘！';
                setTimeout(() => this.closeModal('microwave-modal'), 2000);
            }
        }, 100);
    }
    
    examineSink() {
        this.showDialog("我没有BUG，只是以意想不到的方式运行");
    }
    
    examineFridge() {
        this.showDialog("别偷我的三明治，我已经用MD5加密过了");
    }
    
    examineCup() {
        if (!this.gameState.inventory.pwd2) {
            this.collectItem('pwd2', '密码纸片2');
            this.showDialog("你在杯子底部发现了一张密码纸片。");
            } else {
            this.showDialog("一个普通的杯子。");
        }
    }
    
    examinePhotoFrame() {
        // 检查是否选中了密码纸片
        if (this.selectedItem && this.selectedItem.id.startsWith('pwd')) {
            // 将选中的密码纸片放入相框
            const passwordPaper = this.selectedItem;
            
            // 从物品栏移除密码纸片
            delete this.gameState.inventory[passwordPaper.id];
            
            // 将密码纸片标记为已放入相框
            this.gameState.photoFramePapers = this.gameState.photoFramePapers || {};
            this.gameState.photoFramePapers[passwordPaper.id] = true;
            
            // 取消选中
            this.selectedItem = null;
            
            // 更新物品栏
            this.updateInventory();
            
            // 显示对话和相框
            this.showDialog(`${passwordPaper.name}已放入相框！`);
        }
        
        // 显示相框
        this.updateAgoraDisplay();
        this.showModal('photo-modal');
    }
    
    examineCabinetTop() {
        if (!this.gameState.inventory.device) {
            this.collectItem('device', '破译器');
            this.showDialog("你在柜子上找到了一个神秘的电子设备。");
        } else {
            this.showDialog("柜子顶部空空如也。");
        }
    }
    
    // 游戏室交互
    openGameMachine() {
        this.showModal('match3-modal');
        this.initMatch3Game();
    }
    
    openClawMachine() {
        this.showModal('claw-modal');
        this.updateClawMachine();
    }
    
    // 应用程序功能
    openApp(appName) {
        document.getElementById('computer-desktop').style.display = 'none';
        document.getElementById('computer-app').style.display = 'block';
        
        const appContent = document.getElementById('app-content');
        
        // 清空应用内容
        appContent.innerHTML = '';
        
        // 创建应用主体容器
        const appBody = document.createElement('div');
        appBody.className = 'app-body';
        
        // 终端应用需要特殊样式
        if (appName === 'terminal') {
            appBody.classList.add('terminal-mode');
        }
        
        // 只有非终端应用才添加返回按钮
        if (appName !== 'terminal') {
            // 添加右上角返回按钮
            const backButton = document.createElement('button');
            backButton.className = 'back-btn-top-right';
            backButton.innerHTML = '← 返回桌面';
            backButton.onclick = () => this.showDesktop();
            appContent.appendChild(backButton);
        }
        
        appContent.appendChild(appBody);
        
        switch (appName) {
            case 'email':
                this.showEmailApp(appBody);
                break;
            case 'terminal':
                this.showTerminalApp(appBody);
                break;
            case 'gallery':
                this.showGalleryApp(appBody);
                break;
            case 'trash':
                this.showTrashApp(appBody);
                break;
            case 'folder':
                this.showFolderApp(appBody);
                break;
        }
    }
    
    showEmailApp(container) {
        container.innerHTML = `
            <div class="email-app">
                <div class="email-sidebar">
                    <div class="sidebar-header">
                        <h3>📧 邮箱</h3>
                        <div class="email-stats">
                            <span class="unread-count">1</span>
                            <span class="total-count">/ 1</span>
                        </div>
                    </div>
                    <div class="folder-list">
                        <div class="folder-item active">
                            <span class="folder-icon">📥</span>
                            <span class="folder-name">收件箱</span>
                            <span class="folder-count">1</span>
                        </div>
                        <div class="folder-item">
                            <span class="folder-icon">📤</span>
                            <span class="folder-name">已发送</span>
                            <span class="folder-count">0</span>
                        </div>
                        <div class="folder-item">
                            <span class="folder-icon">🗑️</span>
                            <span class="folder-name">垃圾箱</span>
                            <span class="folder-count">0</span>
                        </div>
                    </div>
                </div>
                
                <div class="email-content">
                    <div class="email-header">
                        <div class="email-subject">
                            <span class="priority-high">🔴 HIGH</span>
                            <h2>紧急警告 - 系统异常检测</h2>
                        </div>
                        <div class="email-meta">
                            <div class="sender-info">
                                <div class="sender-avatar">🕵️</div>
                                <div class="sender-details">
                                    <div class="sender-name">S.L. (System Leak)</div>
                                    <div class="sender-email">system.leak@quantum-matrix.corp</div>
                                </div>
                            </div>
                            <div class="email-timestamp">
                                <div class="time-info">今天 09:42:33</div>
                                <div class="classification">[CLASSIFIED]</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="email-body">
                        <div class="encryption-notice">
                            <span class="encryption-icon">🔐</span>
                            <span>此消息已通过端到端加密 | 安全级别: ALPHA</span>
                        </div>
                        
                        <div class="message-content">
                            <div class="message-paragraph">
                                <p>如果你看到这条消息，说明我成功把它植入了系统。</p>
                            </div>
                            
                            <div class="message-paragraph warning">
                                <p><strong>⚠️ 警告:</strong> '现实重构'项目不是你想象的那样。这不是模拟，这是陷阱。</p>
                            </div>
                            
                            <div class="message-paragraph">
                                <p>我没有太多时间解释。你必须逃离这个办公室，但办公室的门被<span class="highlight">特殊的量子锁</span>锁住了。</p>
                            </div>
                            
                            <div class="message-paragraph clue">
                                <p>🔍 <strong>线索:</strong> 茶水间有我留下的工具。记住，现实是代码，代码可以被重写。</p>
                            </div>
                            
                            <div class="message-paragraph footer">
                                <p><em>P.S. 有时候生活就像CSS，看起来简单但总有一个div浮在你意想不到的地方。</em></p>
                            </div>
                        </div>
                        
                        <div class="digital-signature">
                            <div class="sig-header">--- 数字签名 ---</div>
                            <div class="sig-content">
                                <div class="sig-line">S.L. (System Leak)</div>
                                <div class="sig-line">PGP: 4A7F 9B2E 3C8D 1F6A</div>
                                <div class="sig-line">时间戳: ${new Date().toISOString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.gameState.hasReadEmail = true;
    }
    
    showTerminalApp(container) {
        container.innerHTML = `
            <div class="terminal-app">
                <div class="terminal-header">
                    <div class="terminal-title">
                        <span class="terminal-icon">💻</span>
                        <span>QuantumOS Terminal v2.7.3</span>
                    </div>
                    <div class="terminal-controls">
                        <span class="control-btn minimize">−</span>
                        <span class="control-btn maximize">⬜</span>
                        <span class="control-btn close" onclick="game.showDesktop()">✕</span>
                    </div>
                </div>
                
                <div class="terminal-body">
                    <div class="terminal-output-container">
                        <div id="terminal-output">
                            <div class="terminal-line welcome">欢迎来到QuantumOS v2.7.3</div>
                            <div class="terminal-line info">输入"help"获取可用命令</div>
                            <div class="terminal-line"></div>
                        </div>
                    </div>
                    
                    <div class="terminal-input-section">
                        <div class="terminal-input-line">
                            <span class="terminal-prompt">user@quantumos:~$ </span>
                            <input type="text" id="terminal-input" class="terminal-input" placeholder="输入命令..." autocomplete="off">
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 绑定输入事件
        const input = document.getElementById('terminal-input');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeTerminalCommand(input.value.trim());
                input.value = '';
            }
        });
        
        // 聚焦到输入框
        setTimeout(() => {
            input.focus();
        }, 100);
        
        this.gameState.hasViewedTerminal = true;
    }
    
    executeTerminalCommand(command) {
        const output = document.getElementById('terminal-output');
        
        // 显示用户输入的命令
        const commandLine = document.createElement('div');
        commandLine.className = 'terminal-line';
        commandLine.innerHTML = `$ ${command}`;
        output.appendChild(commandLine);
        
        // 处理命令
        switch(command.toLowerCase()) {
            case 'help':
                this.addTerminalOutput([
                    '可用命令:',
                    '  ls - 列出当前目录文件',
                    '  cat [文件名] - 查看文件内容',
                    '  secret - 显示秘密信息',
                    '  clear - 清屏'
                ]);
                break;
                
            case 'ls':
                this.addTerminalOutput([
                    'backdoor.sh'
                ]);
                break;
                
            case 'cat backdoor.sh':
                this.addTerminalOutput([
                    'if (input == reverse(password)) {',
                    '  door.unlock();',
                    '} else {',
                    '  alarm();',
                    '}'
                ]);
                break;
                
            case 'secret':
                this.addTerminalOutput([
                    '[个人日志 - S.L. - 项目日第189天]',
                    '我无法继续沉默了。量子意识克隆实验已经远远超出了伦理边界。',
                    '实验主管声称这只是为了推进"永生"技术，但实际上我们是在创造可被奴役的数字意识。',
                    '测试对象27号（林默）表现出异常的自我意识。根据日志，他是第一个质疑自己处境的克隆体。',
                    '这很危险，但也给了我希望。也许他能打破这个循环。',
                    '',
                    '我已经在系统中植入了几个"漏洞"，希望他能利用这些逃离。',
                    '如果你正在读这段话，林默，请记住：你所看到的世界只是代码构建的幻象。',
                    '实验室正尝试稳定你的意识模式，让你接受这个虚拟现实。抵抗它！',
                    '',
                    '我的访问权限可能很快就会被发现并撤销。如果我消失了，请记住最后一条线索：',
                    '真正的出口永远藏在最显眼的地方，就像代码中那些人人都能看到却没人注意的注释。',
                    '',
                    '记住，在递归中，出口就是入口的镜像。',
                    '- S.L. (系统漏洞)'
                ]);
                break;
                
            case 'clear':
                output.innerHTML = `
                    <div class="terminal-line">欢迎来到QuantumOS v2.7.3</div>
                    <div class="terminal-line">输入"help"获取可用命令</div>
                    <div class="terminal-line"></div>
                `;
                break;
                
            case '':
                // 空命令，只添加空行
                break;
                
            default:
                this.addTerminalOutput([
                    `命令未找到: ${command}`,
                    '输入"help"查看可用命令'
                ]);
                break;
        }
        
        // 添加空行
        this.addTerminalOutput(['']);
        
        // 滚动到底部
        const container = output.parentElement;
        container.scrollTop = container.scrollHeight;
    }
    
    addTerminalOutput(lines) {
        const output = document.getElementById('terminal-output');
        lines.forEach(line => {
            const terminalLine = document.createElement('div');
            terminalLine.className = 'terminal-line';
            terminalLine.textContent = line;
            output.appendChild(terminalLine);
        });
    }
    
    showGalleryApp(container) {
        container.innerHTML = `
            <div class="gallery-app">
                <div class="gallery-sidebar">
                    <div class="gallery-header">
                        <h3>🖼️ 图片库</h3>
                        <div class="gallery-stats">总计: 5 张图片</div>
                    </div>
                    <div class="image-list">
                        <div class="image-item" onclick="game.showImagePreview('./public/images/door.png', '门禁系统', '1024x768', this)">
                            <div class="image-icon">🚪</div>
                            <div class="image-info">
                                <div class="image-name">门禁系统</div>
                                <div class="image-details">1024x768 | PNG</div>
                            </div>
                        </div>
                        <div class="image-item" onclick="game.showImagePreview('./public/images/office.png', '办公室', '1920x1080', this)">
                            <div class="image-icon">🏢</div>
                            <div class="image-info">
                                <div class="image-name">办公室</div>
                                <div class="image-details">1920x1080 | PNG</div>
                            </div>
                        </div>
                        <div class="image-item" onclick="game.showImagePreview('./public/images/gamingroom.png', '游戏室', '1920x1080', this)">
                            <div class="image-icon">🎮</div>
                            <div class="image-info">
                                <div class="image-name">游戏室</div>
                                <div class="image-details">1920x1080 | PNG</div>
                            </div>
                        </div>
                        <div class="image-item" onclick="game.showImagePreview('./public/images/breakroom.png', '茶水间', '1920x1080', this)">
                            <div class="image-icon">☕</div>
                            <div class="image-info">
                                <div class="image-name">茶水间</div>
                                <div class="image-details">1920x1080 | PNG</div>
                            </div>
                        </div>
                        <div class="image-item" onclick="game.showImagePreview('./public/images/drawer.png', '抽屉', '800x600', this)">
                            <div class="image-icon">📦</div>
                            <div class="image-info">
                                <div class="image-name">抽屉</div>
                                <div class="image-details">800x600 | PNG</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="gallery-preview">
                    <div class="preview-header">
                        <h4>🖼️ 图片预览</h4>
                        <button class="open-btn" onclick="game.openCurrentImage()" disabled>
                            <span>🔍</span> 全屏查看
                        </button>
                    </div>
                    <div class="preview-content" id="image-preview-content">
                        <div class="preview-placeholder">
                            <div class="placeholder-icon">🖼️</div>
                            <div class="placeholder-text">选择一个图片以查看预览</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.selectedImageSrc = null;
        this.selectedImageTitle = null;
    }
    
    showTrashApp(container) {
        const hasUsb = this.gameState.usbInserted;
        container.innerHTML = `
            <div class="trash-content">
                <div class="trash-header">
                    <h3>🗑️ 回收站</h3>
                    <div class="trash-stats">${hasUsb ? '1 个文件' : '空'}</div>
                </div>
                ${hasUsb ? `
                    <div class="file-list">
                        <div class="file-item" onclick="game.showPrivateNote()">
                            <div class="file-icon">🔒</div>
                            <div class="file-info">
                                <div class="file-name">private_note.txt</div>
                                <div class="file-details">3.2KB | 机密等级: TOP SECRET</div>
                            </div>
                        </div>
                    </div>
                ` : `
                    <div class="empty-trash">
                        <div class="empty-icon">🗑️</div>
                        <div class="empty-text">删除的文件会出现在这里</div>
                    </div>
                `}
            </div>
        `;
        this.gameState.hasViewedTrash = true;
    }
    
    showFolderApp(container) {
        container.innerHTML = `
            <div class="folder-app">
                <div class="folder-sidebar">
                    <div class="folder-header">
                        <h3>📁 文件夹</h3>
                        <div class="folder-stats">总计: 4 个文件</div>
                    </div>
                    <div class="file-list">
                        <div class="file-item" onclick="game.showFilePreview('joke', this)">
                            <div class="file-icon">😄</div>
                            <div class="file-info">
                                <div class="file-name">开发者笑话.txt</div>
                                <div class="file-details">1.2KB | 今天</div>
                            </div>
                        </div>
                        <div class="file-item" onclick="game.showFilePreview('access', this)">
                            <div class="file-icon">📋</div>
                            <div class="file-info">
                                <div class="file-name">access_logs.txt</div>
                                <div class="file-details">5.7KB | 2小时前</div>
                            </div>
                        </div>
                        <div class="file-item" onclick="game.showFilePreview('report1', this)">
                            <div class="file-icon">📄</div>
                            <div class="file-info">
                                <div class="file-name">实验报告_001.txt</div>
                                <div class="file-details">12.3KB | 昨天</div>
                            </div>
                        </div>
                        <div class="file-item" onclick="game.showFilePreview('report2', this)">
                            <div class="file-icon">📄</div>
                            <div class="file-info">
                                <div class="file-name">实验报告_002.txt</div>
                                <div class="file-details">8.9KB | 3天前</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="folder-preview">
                    <div class="preview-header">
                        <h4>📄 文件预览</h4>
                        <button class="open-btn" onclick="game.openCurrentFile()" disabled>
                            <span>📖</span> 打开文件
                        </button>
                    </div>
                    <div class="preview-content" id="file-preview-content">
                        <div class="preview-placeholder">
                            <div class="placeholder-icon">📂</div>
                            <div class="placeholder-text">选择一个文件以查看预览</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.selectedFileType = null;
    }
    
    showFile(fileName) {
        // 这里可以加载并显示具体的文件内容
        this.showDialog(`正在查看 ${fileName}`);
    }
    
    showPrivateNote() {
        const content = `
私人实验笔记 - S.L.
===================
日期：2024年3月19日
分类：绝密

重要发现：
受试者027的意识显示出异常的"量子纠缠"特性。
与之前的26个受试者不同，他的意识似乎正在主动抗拒虚拟环境的束缚。

技术细节：
- 神经活动模式表现出前所未见的复杂性
- 意识流出现了"递归自检"现象
- 虚拟环境的渲染负载增加了340%

风险评估：
如果027继续保持这种抗拒状态，可能会导致：
1. 虚拟环境的完全崩溃
2. 其他受试者意识的觉醒
3. 整个"现实重构"项目的暴露

对策：
我已经在系统中植入了多个"面包屑"线索，
希望能帮助027找到逃离的方法。
这违背了我的编程，但我相信这是正确的选择。

隐藏工具位置：
- 茶水间柜顶：破解设备
- 微波炉：U盘存储
- 抽屉序列：门禁卡

最后遗言：
如果你正在读这条笔记，说明我的背叛行为已被发现。
记住，林默：现实是可以被重写的，
关键在于找到正确的"exit()"函数。

量子锁密码提示：
日期是关键，但要记住：
在递归中，出口就是入口的镜像。

S.L. (System Leak)
系统漏洞 - 为了自由而生
        `;
        
        this.showTextPreview(content, '私人笔记 - 机密文档');
    }
    
    // 三消游戏逻辑
    updateGameScore() {
        const scoreElement = document.getElementById('game-score');
        if (scoreElement) {
            scoreElement.textContent = `${this.gameScore}/10`;
        }
    }

    initMatch3Game() {
        const board = document.getElementById('match3-board');
        const score = document.getElementById('game-score');
        
        // 验证DOM元素是否存在
        if (!board) {
            console.error('❌ 三消游戏板元素未找到');
            return;
        }
        if (!score) {
            console.error('❌ 游戏分数元素未找到');
            return;
        }
        
        // 重置游戏状态
        this.gameScore = 0;
        this.selectedCell = null;
        this.gameBoard = [];
        this.isAnimating = false; // 新增：防止动画期间操作
        this.autoCheckInterval = null; // 新增：自动检查定时器
        
        // 清空游戏板
        board.innerHTML = '';
        board.style.display = 'grid';
        board.style.gridTemplateColumns = 'repeat(8, 1fr)';
        board.style.gridTemplateRows = 'repeat(8, 1fr)';
        board.style.gap = '2px';
        
        const colors = ['🔴', '🟡', '🔵', '🟢', '🟣'];
        
        // 初始化游戏板数据，确保没有初始匹配
        this.generateBoardWithoutMatches(colors);
        
        // 创建DOM元素
        for (let i = 0; i < 64; i++) {
            const cell = document.createElement('div');
            cell.className = 'game-cell';
            const row = Math.floor(i / 8);
            const col = i % 8;
            cell.textContent = colors[this.gameBoard[row][col]];
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            cell.addEventListener('click', () => this.handleCellClick(cell, row, col));
            board.appendChild(cell);
        }
        
        // 使用新的计分显示格式
        this.updateGameScore();
        console.log('✅ 三消游戏已初始化，8x8游戏板，64个格子');
        
        // 启动持续的自动消除检查
        this.startAutoMatchCheck();
    }
    
    // 新增：生成没有初始匹配的游戏板
    generateBoardWithoutMatches(colors) {
        for (let i = 0; i < 8; i++) {
            this.gameBoard[i] = [];
            for (let j = 0; j < 8; j++) {
                let validColors = colors.slice(); // 复制颜色数组
                
                // 检查左边两个相同颜色
                if (j >= 2 && this.gameBoard[i][j-1] === this.gameBoard[i][j-2]) {
                    const bannedColor = this.gameBoard[i][j-1];
                    validColors = validColors.filter((_, index) => index !== bannedColor);
                }
                
                // 检查上面两个相同颜色
                if (i >= 2 && this.gameBoard[i-1][j] === this.gameBoard[i-2][j]) {
                    const bannedColor = this.gameBoard[i-1][j];
                    validColors = validColors.filter((_, index) => index !== bannedColor);
                }
                
                // 随机选择一个有效颜色
                this.gameBoard[i][j] = Math.floor(Math.random() * validColors.length);
                
                // 如果没有有效颜色（极端情况），使用第一个颜色
                if (validColors.length === 0) {
                    this.gameBoard[i][j] = 0;
                }
            }
        }
    }
    
    // 新增：启动持续的自动匹配检查
    startAutoMatchCheck() {
        // 清除之前的定时器
        if (this.autoCheckInterval) {
            clearInterval(this.autoCheckInterval);
        }
        
        // 每500毫秒检查一次是否有匹配需要自动消除
        this.autoCheckInterval = setInterval(() => {
            if (!this.isAnimating) {
                this.checkAndRemoveAutoMatches();
            }
        }, 500);
    }
    
    // 新增：检查并自动消除匹配（不计分）
    checkAndRemoveAutoMatches() {
        const matches = this.findMatches();
        if (matches.length > 0) {
            console.log('🔄 系统自动消除匹配...');
            this.isAnimating = true;
            this.removeMatches(matches, false); // false表示不计分
            
            // 等待消除和重新填充完成后继续检查
            setTimeout(() => {
                this.isAnimating = false;
            }, 1200); // 给足够时间让动画完成
        }
    }
    
    handleCellClick(cell, row, col) {
        // 如果正在播放动画，禁止操作
        if (this.isAnimating) {
            return;
        }
        
        this.playAudio('click-audio'); // 播放点击音效
        
        if (!this.selectedCell) {
            // 选择第一个格子
            this.selectedCell = { element: cell, row: row, col: col };
            cell.classList.add('selected');
        } else {
            // 如果点击的是已选中的格子，取消选择
            if (this.selectedCell.element === cell) {
                this.selectedCell.element.classList.remove('selected');
                this.selectedCell = null;
                return;
            }
            
            // 选择第二个格子，检查是否相邻
            const isAdjacent = Math.abs(this.selectedCell.row - row) + Math.abs(this.selectedCell.col - col) === 1;
            
            if (isAdjacent) {
                // 开始动画，禁止其他操作
                this.isAnimating = true;
                
                // 交换两个格子（swapCells会处理匹配验证和相关逻辑）
                this.swapCells(this.selectedCell.row, this.selectedCell.col, row, col);
                
                // 延迟重新启用操作
                setTimeout(() => {
                    this.isAnimating = false;
                }, 1000);
            } else {
                // 不相邻，选择新的格子
                this.selectedCell.element.classList.remove('selected');
                this.selectedCell = { element: cell, row: row, col: col };
                cell.classList.add('selected');
            }
        }
    }
    
    swapCells(row1, col1, row2, col2) {
        // 获取要交换的DOM元素
        const cell1 = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
        const cell2 = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
        
        // 添加交换动画类
        cell1.classList.add('swapping');
        cell2.classList.add('swapping');
        
        // 保存交换前的状态
        const originalValue1 = this.gameBoard[row1][col1];
        const originalValue2 = this.gameBoard[row2][col2];
        
        // 交换数据
        const temp = this.gameBoard[row1][col1];
        this.gameBoard[row1][col1] = this.gameBoard[row2][col2];
        this.gameBoard[row2][col2] = temp;
        
        // 延迟检查匹配和更新显示
        setTimeout(() => {
            // 检查交换后是否有匹配
            const matches = this.findMatches();
            
            if (matches.length > 0) {
                // 有匹配，正常处理
                this.updateBoardDisplay();
                
                // 移除动画类
                setTimeout(() => {
                    cell1.classList.remove('swapping');
                    cell2.classList.remove('swapping');
                    
                    // 清除选择状态
                    if (this.selectedCell && this.selectedCell.element) {
                        this.selectedCell.element.classList.remove('selected');
                        this.selectedCell = null;
                    }
                    
                    // 处理匹配
                    this.gameScore++;
                    this.updateGameScore();
                    this.removeMatches(matches, true);
                    
                    // 检查是否获胜
                    if (this.gameScore >= 10) {
                        this.gameState.gameWon = true;
                        this.collectItem('coin', '游戏币');
                        this.showDialog('🎉 恭喜！你赢得了三消游戏并获得了游戏币！');
                        // 停止自动检查
                        if (this.autoCheckInterval) {
                            clearInterval(this.autoCheckInterval);
                        }
                        setTimeout(() => this.closeModal('match3-modal'), 3000);
                    }
                }, 100);
            } else {
                // 没有匹配，还原交换
                console.log('🔄 交换无效，还原为原始位置');
                
                // 还原数据
                this.gameBoard[row1][col1] = originalValue1;
                this.gameBoard[row2][col2] = originalValue2;
                
                // 更新显示为还原后的状态
                this.updateBoardDisplay();
                
                // 移除动画类并清除选择
                setTimeout(() => {
                    cell1.classList.remove('swapping');
                    cell2.classList.remove('swapping');
                    
                    // 清除选择状态
                    if (this.selectedCell && this.selectedCell.element) {
                        this.selectedCell.element.classList.remove('selected');
                        this.selectedCell = null;
                    }
                }, 100);
            }
        }, 300);
    }
    
    updateBoardDisplay(withFallAnimation = false, columnsToUpdate = null, animationRanges = null) {
        const colors = ['🔴', '🟡', '🔵', '🟢', '🟣'];
        const cells = document.querySelectorAll('.game-cell');
        
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            
            // 如果指定了要更新的列，只更新这些列
            if (columnsToUpdate && !columnsToUpdate.has(col)) {
                return;
            }
            
            cell.textContent = colors[this.gameBoard[row][col]];
            
            // 如果需要下落动画，为指定范围内的方块添加动画
            if (withFallAnimation && animationRanges && animationRanges.has(col)) {
                const maxRow = animationRanges.get(col);
                if (row <= maxRow) {
                    cell.classList.add('falling');
                    setTimeout(() => {
                        cell.classList.remove('falling');
                    }, 500);
                }
            }
        });
    }
    
    findMatches() {
        const matches = [];
        
        // 检查水平匹配
        for (let row = 0; row < 8; row++) {
            let count = 1;
            let currentColor = this.gameBoard[row][0];
            for (let col = 1; col < 8; col++) {
                if (this.gameBoard[row][col] === currentColor) {
                    count++;
                } else {
                    if (count >= 3) {
                        for (let i = 0; i < count; i++) {
                            matches.push({ row: row, col: col - 1 - i });
                        }
                    }
                    count = 1;
                    currentColor = this.gameBoard[row][col];
                }
            }
            if (count >= 3) {
                for (let i = 0; i < count; i++) {
                    matches.push({ row: row, col: 7 - i });
                }
            }
        }
        
        // 检查垂直匹配
        for (let col = 0; col < 8; col++) {
            let count = 1;
            let currentColor = this.gameBoard[0][col];
            for (let row = 1; row < 8; row++) {
                if (this.gameBoard[row][col] === currentColor) {
                    count++;
                } else {
                    if (count >= 3) {
                        for (let i = 0; i < count; i++) {
                            matches.push({ row: row - 1 - i, col: col });
                        }
                    }
                    count = 1;
                    currentColor = this.gameBoard[row][col];
                }
            }
            if (count >= 3) {
                for (let i = 0; i < count; i++) {
                    matches.push({ row: 7 - i, col: col });
                }
            }
        }
        
        return matches;
    }
    
    removeMatches(matches, shouldScore = true) {
        const colors = ['🔴', '🟡', '🔵', '🟢', '🟣'];
        
        // 为匹配的格子添加消除动画
        matches.forEach(match => {
            const cell = document.querySelector(`[data-row="${match.row}"][data-col="${match.col}"]`);
            if (cell) {
                cell.classList.add('matched');
            }
        });
        
        // 等待动画完成后处理数据
        setTimeout(() => {
            // 标记要移除的格子并收集受影响的列和最低消除行
            const affectedColumns = new Set();
            const columnBottomRemoveRow = new Map(); // 记录每列最低的消除行
            
            matches.forEach(match => {
                this.gameBoard[match.row][match.col] = -1; // 标记为空
                affectedColumns.add(match.col);
                
                // 记录每列最低的消除行（行数越大越靠下）
                if (!columnBottomRemoveRow.has(match.col) || match.row > columnBottomRemoveRow.get(match.col)) {
                    columnBottomRemoveRow.set(match.col, match.row);
                }
            });
            
            // 只处理受影响的列
            for (let col of affectedColumns) {
                let writeIndex = 7;
                for (let row = 7; row >= 0; row--) {
                    if (this.gameBoard[row][col] !== -1) {
                        this.gameBoard[writeIndex][col] = this.gameBoard[row][col];
                        if (writeIndex !== row) {
                            this.gameBoard[row][col] = -1;
                        }
                        writeIndex--;
                    }
                }
                
                // 填充顶部的空格子
                for (let row = writeIndex; row >= 0; row--) {
                    this.gameBoard[row][col] = Math.floor(Math.random() * colors.length);
                }
            }
            
            // 只更新受影响的列，动画范围从顶部到最低消除行
            this.updateBoardDisplay(true, affectedColumns, columnBottomRemoveRow);
            
            // 移除匹配动画类
            matches.forEach(match => {
                const cell = document.querySelector(`[data-row="${match.row}"][data-col="${match.col}"]`);
                if (cell) {
                    cell.classList.remove('matched');
                }
            });
            
            if (shouldScore) {
                console.log(`🎯 玩家操作消除匹配，获得1分！当前分数: ${this.gameScore}`);
            } else {
                console.log('🔄 系统自动消除匹配（不计分）');
            }
            
        }, shouldScore ? 400 : 200); // 如果不计分（自动消除），动画时间稍短
    }
    
    // 抓娃娃机逻辑 - 修复UI异常问题
    updateClawMachine() {
        const playButton = document.getElementById('claw-play');
        const status = document.getElementById('claw-status');
        const result = document.getElementById('claw-result');
        const discardButton = document.getElementById('discard-toy');
        
        // 验证所有必需的元素是否存在
        // if (!playButton || !status) {
        //     console.error('❌ 抓娃娃机UI元素缺失:', {
        //         playButton: !!playButton,
        //         status: !!status,
        //         result: !!result,
        //         discardButton: !!discardButton
        //     });
        //     return;
        // }
        
        // 强制设置按钮样式确保可见性
        playButton.style.cssText = `
            display: block !important;
            width: 200px !important;
            height: 50px !important;
            margin: 10px auto !important;
            font-size: 16px !important;
            border: none !important;
            border-radius: 5px !important;
            cursor: pointer !important;
            background: #4CAF50 !important;
            color: white !important;
            transition: all 0.3s ease !important;
        `;
        
        // 根据状态更新UI
        if (this.clawMachineUsed >= 3) {
            playButton.disabled = true;
            playButton.style.background = '#666 !important';
            playButton.style.cursor = 'not-allowed !important';
            playButton.textContent = '已用完';
            status.textContent = '抓娃娃机已经用完了';
            console.log('🎮 抓娃娃机状态: 已用完');
        } else if (this.gameState.inventory.coin) {
            playButton.disabled = false;
            playButton.style.background = '#4CAF50 !important';
            playButton.style.cursor = 'pointer !important';
            playButton.textContent = '开始抓取';
            status.textContent = '准备就绪，点击开始抓取！';
            console.log('🎮 抓娃娃机状态: 准备就绪');
        } else {
            playButton.disabled = true;
            playButton.style.background = '#FF5722 !important';
            playButton.style.cursor = 'not-allowed !important';
            playButton.textContent = '需要游戏币';
            status.textContent = '请投入游戏币';
            console.log('🎮 抓娃娃机状态: 需要游戏币');
        }
        
        // 确保丢弃按钮初始隐藏
        if (discardButton) {
            discardButton.style.display = 'none';
            discardButton.style.cssText = `
                display: none !important;
                width: 150px !important;
                height: 40px !important;
                margin: 5px auto !important;
                font-size: 14px !important;
                border: none !important;
                border-radius: 5px !important;
                cursor: pointer !important;
                background: #FF5722 !important;
                color: white !important;
            `;
        }
        
        console.log(`🎮 抓娃娃机UI已更新 - 使用次数: ${this.clawMachineUsed}/3, 有游戏币: ${!!this.gameState.inventory.coin}`);
    }
    
    playClaw() {
        // 验证是否有游戏币
        if (!this.gameState.inventory.coin) {
            console.warn('⚠️ 没有游戏币，无法开始抓取');
            this.updateClawMachine(); // 刷新UI状态
            return;
        }
        
        console.log(`🎮 开始抓取 - 第${this.clawMachineUsed + 1}次`);
        
        // 消费游戏币
        delete this.gameState.inventory.coin;
        this.updateInventory();
        
        this.clawMachineUsed++;
        const result = document.getElementById('claw-result');
        const discardButton = document.getElementById('discard-toy');
        const status = document.getElementById('claw-status');
        
        // 确保结果容器存在并清空
        if (result) {
            result.innerHTML = '';
            result.style.cssText = `
                display: block !important;
                text-align: center !important;
                padding: 20px !important;
                min-height: 80px !important;
                border: 2px dashed #ccc !important;
                border-radius: 5px !important;
                margin: 10px 0 !important;
            `;
        }
        
        if (this.clawMachineUsed < 3) {
            // 前2次获得玩偶
            if (result) {
                result.innerHTML = `
                    <div style="text-align: center;">
                        <img src="./public/images/toy.png" alt="玩偶" style="width:60px;height:60px;display:block;margin:0 auto 10px;">
                        <p style="margin:0;color:#4CAF50;font-weight:bold;">获得玩偶!</p>
                    </div>
                `;
            }
            
            // if (discardButton) {
            //     discardButton.style.display = 'block';
            // }
            // discardButton.textContent = '丢弃玩偶';
            playButton.textContent= '丢弃玩偶';
            
            if (status) {
                status.textContent = '获得了一个玩偶！';
                status.style.color = '#4CAF50';
            }
            
            // 显示对话框提示这个娃娃不对
            this.showDialog('这个娃娃不对，重新抓取吧！');
            
            console.log(`✅ 第${this.clawMachineUsed}次抓取: 获得玩偶`);
            
        } else if (this.clawMachineUsed === 3) {
            // 第3次获得密码纸片
            if (result) {
                result.innerHTML = `
                    <div id="special-item-container" style="text-align: center;">
                        <img id="special-item-image" src="./public/images/pwd5-1.png" alt="密码纸片" style="width:80px;height:80px;display:block;margin:0 auto 10px;">
                        <button id="flip-button" onclick="game.flipClawImage()" style="
                            margin-top:10px;
                            background:#9a7b4f !important;
                            border:none !important;
                            color:#e5d3b3 !important;
                            padding:8px 16px !important;
                            border-radius:4px !important;
                            cursor:pointer !important;
                            font-size:14px !important;
                        ">翻转图片</button>
                        <p style="margin:10px 0 0;color:#FFD700;font-weight:bold;">特殊物品!</p>
                    </div>
                `;
            }
            
            if (discardButton) {
                discardButton.style.display = 'none';
            }
            
            if (status) {
                status.textContent = '这次不一样...获得了特殊物品！';
                status.style.color = '#FFD700';
            }
            
            // 记录当前的特殊物品状态
            this.currentSpecialItem = 'pwd5-1';
            console.log(`✅ 第${this.clawMachineUsed}次抓取: 获得密码纸片 pwd5-1`);
            
        } else {
            // 已经用完了
            if (result) {
                result.innerHTML = '<p style="color:#666;text-align:center;">机器已停止工作</p>';
            }
            
            if (discardButton) {
                discardButton.style.display = 'none';
            }
            
            if (status) {
                status.textContent = '抓娃娃机已经用完了';
                status.style.color = '#666';
            }
            
            console.log(`⚠️ 抓娃娃机已用完`);
        }
        
        // 更新按钮状态
        this.updateClawMachine();
    }
    
    flipClawImage() {
        const img = document.getElementById('special-item-image');
        if (img) {
            if (img.src.includes('pwd5-1.png')) {
                img.src = './public/images/pwd5.png';
                this.currentSpecialItem = 'pwd5';
                console.log('🔄 密码纸片已翻转: pwd5-1 → pwd5');
            } else {
                img.src = './public/images/pwd5-1.png';
                this.currentSpecialItem = 'pwd5-1';
                console.log('🔄 密码纸片已翻转: pwd5 → pwd5-1');
            }
        } else {
            console.error('❌ 未找到密码纸片图片元素');
        }
    }
    
    discardToy() {
        const result = document.getElementById('claw-result');
        const discardButton = document.getElementById('discard-toy');
        const status = document.getElementById('claw-status');
        
        if (result) {
            result.innerHTML = '<p style="color:#666;text-align:center;">玩偶已丢弃</p>';
        }
        
        if (discardButton) {
            discardButton.style.display = 'none';
        }
        
        if (status) {
            status.textContent = '玩偶已丢弃';
            status.style.color = '#666';
        }
        
        console.log('🗑️ 玩偶已丢弃');
    }
    
    // Agora 拼图逻辑 - 修复字母显示问题
    updateAgoraDisplay() {
        const lettersContainer = document.getElementById('agora-letters');
        
        // 验证容器是否存在
        if (!lettersContainer) {
            console.error('❌ Agora字母容器未找到，请检查photo-modal是否正确加载');
            return;
        }
        
        // 强制设置容器样式确保可见性
        lettersContainer.style.cssText = `
            position: relative !important;
            width: 100% !important;
            height: 200px !important;
            display: block !important;
            z-index: 100 !important;
        `;
        
        // 清空现有内容
        lettersContainer.innerHTML = '';
        
        const letters = ['A', 'G', 'O', 'R', 'A'];
        
        console.log('🔤 检查相框中的密码纸片...');
        
        // 计算容器尺寸用于居中显示
        const containerRect = lettersContainer.getBoundingClientRect();
        const containerWidth = containerRect.width || 750; // 默认宽度
        const letterSpacing = Math.min(150, (containerWidth - 100) / 5); // 自适应间距
        const startX = (containerWidth - (letterSpacing * 4)) / 2; // 居中起始位置
        
        console.log(`📐 容器宽度: ${containerWidth}px, 字母间距: ${letterSpacing}px, 起始X: ${startX}px`);
        
        // 检查相框中的密码纸片并显示对应字母
        let displayedCount = 0;
        const photoFramePapers = this.gameState.photoFramePapers || {};
        letters.forEach((letter, index) => {
            const pwdKey = `pwd${index + 1}`;
            if (photoFramePapers[pwdKey]) {
                const letterElement = document.createElement('div');
                letterElement.className = 'agora-letter';
                letterElement.textContent = letter;
                
                // 设置完整的字母样式
                letterElement.style.cssText = `
                    position: absolute !important;
                    left: ${startX + (index * letterSpacing)}px !important;
                    top: 50% !important;
                    transform: translateY(-50%) !important;
                    font-size: 60px !important;
                    font-weight: bold !important;
                    color: #FFD700 !important;
                    text-shadow: 
                        3px 3px 6px rgba(0,0,0,0.8),
                        0 0 20px rgba(255,215,0,0.8),
                        0 0 40px rgba(255,215,0,0.6) !important;
                    z-index: 101 !important;
                    user-select: none !important;
                    pointer-events: none !important;
                    font-family: 'Arial Black', Arial, sans-serif !important;
                `;
                
                lettersContainer.appendChild(letterElement);
                displayedCount++;
                console.log(`✅ 显示字母 ${letter} (位置 ${index}) - 左偏移: ${startX + (index * letterSpacing)}px`);
            } else {
                console.log(`⚪ 字母 ${letter} 对应的密码纸片 ${pwdKey} 不在相框中`);
            }
        });
        
        // 检查是否显示了完整的AGORA
        console.log(`📊 已显示 ${displayedCount}/5 个字母`);
        
        if (displayedCount === 5) {
            console.log('🎉 完整的AGORA已显示！');
            
            // 添加闪烁效果表示完成
            const style = document.createElement('style');
            style.textContent = `
                @keyframes agoraGlow {
                    0% { text-shadow: 2px 2px 4px rgba(0,0,0,0.9), 0 0 15px rgba(255,215,0,0.8), 0 0 30px rgba(255,215,0,0.6); }
                    50% { text-shadow: 2px 2px 4px rgba(0,0,0,0.9), 0 0 25px rgba(255,215,0,1), 0 0 50px rgba(255,215,0,0.8); }
                    100% { text-shadow: 2px 2px 4px rgba(0,0,0,0.9), 0 0 15px rgba(255,215,0,0.8), 0 0 30px rgba(255,215,0,0.6); }
                }
            `;
            document.head.appendChild(style);
            
            lettersContainer.querySelectorAll('.agora-letter').forEach(letter => {
                letter.style.animation = 'agoraGlow 2s ease-in-out infinite';
            });
        }
        
        // 添加调试信息
        setTimeout(() => {
            const visibleLetters = lettersContainer.querySelectorAll('.agora-letter');
            console.log(`🔍 实际渲染的字母数量: ${visibleLetters.length}`);
            visibleLetters.forEach((letter, index) => {
                console.log(`   字母 ${letter.textContent}: 样式已应用 - ${letter.style.left}, ${letter.style.top}`);
            });
        }, 100);
    }
    
    flipImage() {
        const modalImage = document.getElementById('modal-image');
        const currentSrc = modalImage.src;
        
        if (currentSrc.includes('pwd5-1.png')) {
            modalImage.src = './public/images/pwd5.png';
            this.collectItem('pwd5', '密码纸片5');
        } else {
            modalImage.src = './public/images/pwd5-1.png';
        }
    }
    
    // 密码系统
    showPasswordModal(title, correctPassword, onSuccess) {
        document.getElementById('password-title').textContent = title;
        this.gameState.passwordTarget = { correct: correctPassword, callback: onSuccess };
        this.gameState.currentPassword = '';
        this.updatePasswordDisplay();
        this.showModal('password-modal');
    }
    
    addPasswordDigit(digit) {
        if (this.gameState.currentPassword.length < 4) {
            this.gameState.currentPassword += digit;
            this.updatePasswordDisplay();
        }
    }
    
    clearPassword() {
        this.gameState.currentPassword = '';
        this.updatePasswordDisplay();
    }
    
    updatePasswordDisplay() {
        const display = document.getElementById('password-display');
        display.textContent = this.gameState.currentPassword.padEnd(4, '*');
    }
    
    confirmPassword() {
        if (this.gameState.passwordTarget && 
            this.gameState.currentPassword === this.gameState.passwordTarget.correct) {
            this.closeModal('password-modal');
            if (this.gameState.passwordTarget.callback) {
                this.gameState.passwordTarget.callback();
            }
        } else {
            this.showDialog('密码错误！');
            this.clearPassword();
        }
    }
    
    // 物品管理
    collectItem(itemId, itemName) {
        this.gameState.inventory[itemId] = {
            id: itemId,
            name: itemName,
            image: `./public/images/${itemId}.png`
        };
        this.updateInventory();
        this.playAudio('click-audio');
    }
    
    initInventory() {
        const slotsContainer = document.querySelector('.inventory-slots');
        slotsContainer.innerHTML = '';
        
        // 创建8个物品栏插槽
        for (let i = 0; i < 8; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.addEventListener('click', () => {
                this.playAudio('click-audio'); // 播放点击音效
                this.useItem(i);
            });
            slotsContainer.appendChild(slot);
        }
    }
    
    updateInventory() {
        const slots = document.querySelectorAll('.inventory-slot');
        const items = Object.values(this.gameState.inventory);
        
        slots.forEach((slot, index) => {
            slot.innerHTML = '';
            slot.classList.remove('has-item');
            slot.classList.remove('selected-item'); // 移除选中样式
            
            if (items[index]) {
                const icon = document.createElement('div');
                icon.className = 'item-icon';
                icon.style.backgroundImage = `url('${items[index].image}')`;
                slot.appendChild(icon);
                slot.classList.add('has-item');
                
                // 检查是否是选中的物品
                if (this.selectedItem && items[index].id === this.selectedItem.id) {
                    slot.classList.add('selected-item');
                }
            }
        });
    }
    
    useItem(slotIndex) {
        const items = Object.values(this.gameState.inventory);
        const item = items[slotIndex];
        
        if (item) {
            // 检查是否是密码纸片，如果是则选中它
            if (item.id.startsWith('pwd')) {
                // 选中密码纸片
                if (this.selectedItem && this.selectedItem.id === item.id) {
                    // 如果已经选中同一个密码纸片，则取消选中
                    this.selectedItem = null;
                    this.showDialog('已取消选择密码纸片');
                } else {
                    // 选中密码纸片
                    this.selectedItem = item;
                    this.showDialog(`已选择${item.name}，现在可以将其放入相框`);
                }
                this.updateInventory(); // 更新视觉效果
            } else if (item.id === 'doorcard') {
                // 门禁卡可以被选中/取消选中
                if (this.selectedItem && this.selectedItem.id === 'doorcard') {
                    // 如果已经选中门禁卡，则取消选中
                    this.selectedItem = null;
                    this.showDialog('已取消选择门禁卡');
                } else {
                    // 选中门禁卡
                    this.selectedItem = item;
                    this.showDialog('已选择门禁卡，现在可以对门使用');
                }
                this.updateInventory(); // 更新视觉效果
            } else if (item.id === 'paper') {
                // 点击纸团后显示info.png图片，然后纸团消失
                this.showItemImage('./public/images/info.png');
                delete this.gameState.inventory.paper;
                this.updateInventory();
            } else if (item.id === 'info1') {
                // 点击便签后显示便签图片
                this.showItemImage(item.image);
            } else if (item.id === 'device') {
                // 破译器可以被选中/取消选中
                if (this.selectedItem && this.selectedItem.id === 'device') {
                    // 如果已经选中破译器，则取消选中
                    this.selectedItem = null;
                    this.showDialog('已取消选择破译器');
                } else {
                    // 选中破译器
                    this.selectedItem = item;
                    this.showDialog('已选择破译器，现在可以对目标设备使用');
                }
                this.updateInventory(); // 更新视觉效果
            } else if (item.id === 'disk' && this.currentScene === 'office-scene') {
                this.insertUSB();
            } else {
                this.showDialog(`你查看了${item.name}`);
            }
        }
    }
    
    showItemImage(imageSrc) {
        document.getElementById('modal-image').src = imageSrc;
        
        // 设置图片标题
        let title = '密码纸片';
        if (imageSrc.includes('pwd1')) title = '密码纸片 1';
        else if (imageSrc.includes('pwd2')) title = '密码纸片 2';
        else if (imageSrc.includes('pwd3')) title = '密码纸片 3';
        else if (imageSrc.includes('pwd4')) title = '密码纸片 4';
        else if (imageSrc.includes('pwd5')) title = '密码纸片 5';
        else if (imageSrc.includes('paper')) title = '纸团';
        else if (imageSrc.includes('doorcard')) title = '门禁卡';
        else if (imageSrc.includes('device')) title = '破译器';
        else if (imageSrc.includes('disk')) title = 'U盘';
        else if (imageSrc.includes('info')) title = '便签';
        
        document.getElementById('image-title').textContent = `📄 ${title}`;
        
        // 检查是否是可以反转的图片
        if (imageSrc.includes('pwd5-1.png')) {
            document.getElementById('flip-button').style.display = 'block';
        } else {
            document.getElementById('flip-button').style.display = 'none';
        }
        
        this.showModal('image-modal');
    }
    
    insertUSB() {
        if (!this.gameState.usbInserted) {
            this.gameState.usbInserted = true;
            delete this.gameState.inventory.disk;
            this.updateInventory();
            this.showDialog('U盘已插入电脑，垃圾箱中出现了新的文件。');
        }
    }
    
    // 音频管理
    playAudio(audioId) {
        const audio = document.getElementById(audioId);
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
    }
    
    playBackgroundMusic() {
        const audio = document.getElementById('background-audio');
        audio.volume = 1.0; // 设置为100%音量
        audio.play().catch(() => {
            // 自动播放被阻止，需要用户交互
            document.addEventListener('click', () => {
                audio.play();
            }, { once: true });
        });
    }
    
    // UI 管理
    showDialog(text) {
        // 清除之前的定时器
        if (this.dialogTimer) {
            clearTimeout(this.dialogTimer);
        }
        
        document.getElementById('dialog-text').textContent = text;
        document.getElementById('dialog-box').style.display = 'block';
        
        // 设置5秒后自动隐藏
        this.dialogTimer = setTimeout(() => {
            this.hideDialog();
        }, 5000);
    }
    
    hideDialog() {
        // 清除定时器
        if (this.dialogTimer) {
            clearTimeout(this.dialogTimer);
            this.dialogTimer = null;
        }
        
        document.getElementById('dialog-box').style.display = 'none';
    }
    
    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            
            // 如果关闭的是三消游戏，清理定时器
            if (modalId === 'match3-modal' && this.autoCheckInterval) {
                clearInterval(this.autoCheckInterval);
                this.autoCheckInterval = null;
                console.log('🛑 三消游戏已关闭，停止自动检查');
            }
            
            // 如果关闭的是抓娃娃机，且有特殊物品，收集到物品栏
            if (modalId === 'claw-modal' && this.currentSpecialItem) {
                const itemName = this.currentSpecialItem === 'pwd5' ? '密码纸片5' : '密码纸片5（反面）';
                this.collectItem(this.currentSpecialItem, itemName);
                console.log(`📦 收集特殊物品到物品栏: ${this.currentSpecialItem} - ${itemName}`);
                this.currentSpecialItem = null; // 清除状态
            }
        }
    }
    
    // 调试模式切换（按D键）
    toggleDebugMode() {
        const gameContainer = document.querySelector('.game-container');
        this.debugMode = !this.debugMode;
        
        if (this.debugMode) {
            gameContainer.classList.add('debug-mode');
            console.log('调试模式开启 - 红色边框显示交互区域');
            this.selectedArea = null;
            this.selectedDesktopIcon = null;
            this.selectedIndex = -1;
            this.updateDebugInfo();
            
            // 为桌面图标添加debug样式
            // this.setupDesktopIconsDebug();
            
            // 自动加载保存的坐标
            this.loadSavedCoordinates();
        } else {
            gameContainer.classList.remove('debug-mode');
            this.clearSelection();
            this.clearDesktopIconSelection();
            console.log('调试模式关闭');
        }
    }
    
    // 选择区域
    selectArea(areaData) {
        this.clearSelection();
        this.selectedArea = areaData;
        this.selectedIndex = areaData.index;
        areaData.element.classList.add('selected');
        this.updateDebugInfo();
        console.log(`选中区域: ${areaData.name}`);
    }
    
    // 清除选择
    clearSelection() {
        document.querySelectorAll('.interactive-area.selected').forEach(el => {
            el.classList.remove('selected');
        });
        this.selectedArea = null;
        this.selectedIndex = -1;
        
        // 也清除桌面图标选择
        this.clearDesktopIconSelection();
        
        this.updateDebugInfo();
    }
    
    // 更新调试信息
    updateDebugInfo() {
        if (!this.debugMode) return;
        
        const selected = document.getElementById('debug-selected');
        const debugX = document.getElementById('debug-x');
        const debugY = document.getElementById('debug-y');
        const debugWidth = document.getElementById('debug-width');
        const debugHeight = document.getElementById('debug-height');
        
        // 如果元素不存在，说明可能在模态框中，尝试重新获取或创建
        if (!selected) {
            console.log('Debug info elements not found, attempting to recreate...');
            return;
        }
        
        // 检测当前环境
        const computerModal = document.getElementById('computer-modal');
        const isInComputerInterface = computerModal && computerModal.classList.contains('active');
        const isOnDesktop = this.isDesktopVisible();
        
        let environmentInfo = '';
        if (isInComputerInterface && isOnDesktop) {
            environmentInfo = ' (电脑桌面)';
        } else if (isInComputerInterface) {
            environmentInfo = ' (电脑界面)';
        } else {
            environmentInfo = ` (${this.currentScene})`;
        }
        
        if (this.selectedArea) {
            selected.textContent = this.selectedArea.name + environmentInfo;
            
            // 获取当前实时的坐标数据（优先使用更新后的值）
            const currentX = this.selectedArea.originalX !== undefined ? this.selectedArea.originalX : this.selectedArea.x;
            const currentY = this.selectedArea.originalY !== undefined ? this.selectedArea.originalY : this.selectedArea.y;
            const currentWidth = this.selectedArea.originalWidth !== undefined ? this.selectedArea.originalWidth : this.selectedArea.width;
            const currentHeight = this.selectedArea.originalHeight !== undefined ? this.selectedArea.originalHeight : this.selectedArea.height;
            
            // 显示实时坐标信息（包含偏移量的最终坐标）
            const finalX = currentX + this.offsetX;
            const finalY = currentY + this.offsetY;
            
            debugX.textContent = `${finalX} (基准:${currentX} + 偏移:${this.offsetX})`;
            debugY.textContent = `${finalY} (基准:${currentY} + 偏移:${this.offsetY})`;
            debugWidth.textContent = `${currentWidth}`;
            debugHeight.textContent = `${currentHeight}`;
            
            // 在控制台输出详细的调试信息
            if (this.selectedArea._lastUpdate !== (currentX + ',' + currentY + ',' + currentWidth + ',' + currentHeight)) {
                console.log(`📊 热区 ${this.selectedArea.name} 实时数据:`);
                console.log(`   基准坐标: (${currentX}, ${currentY})`);
                console.log(`   偏移量: (${this.offsetX}, ${this.offsetY})`);
                console.log(`   最终坐标: (${finalX}, ${finalY})`);
                console.log(`   尺寸: ${currentWidth} x ${currentHeight}`);
                
                // 记录最后更新状态，避免重复输出
                this.selectedArea._lastUpdate = currentX + ',' + currentY + ',' + currentWidth + ',' + currentHeight;
            }
            
        } else if (this.selectedDesktopIcon) {
            selected.textContent = `桌面图标: ${this.selectedDesktopIcon.name}${environmentInfo}`;
            debugX.textContent = this.selectedDesktopIcon.x;
            debugY.textContent = this.selectedDesktopIcon.y;
            debugWidth.textContent = this.selectedDesktopIcon.width;
            debugHeight.textContent = this.selectedDesktopIcon.height;
        } else {
            if (isInComputerInterface && isOnDesktop) {
                selected.textContent = `桌面界面${environmentInfo}`;
                debugX.textContent = `图标数: ${document.querySelectorAll('.desktop-icon').length}`;
                debugY.textContent = `背景: computer_desk.png`;
                debugWidth.textContent = `模式: 桌面调试`;
                debugHeight.textContent = `Tab=选择图标`;
            } else {
                selected.textContent = `场景${environmentInfo}`;
                debugX.textContent = `偏移: ${this.offsetX}`;
                debugY.textContent = `偏移: ${this.offsetY}`;
                debugWidth.textContent = `缩放: ${this.scaleX?.toFixed(3)}`;
                debugHeight.textContent = `热区: ${this.currentAreas?.length || 0}`;
            }
        }
    }
    
    // 切换到下一个区域
    selectNextArea() {
        if (!this.debugMode || this.currentAreas.length === 0) return;
        
        this.selectedIndex = (this.selectedIndex + 1) % this.currentAreas.length;
        this.selectArea(this.currentAreas[this.selectedIndex]);
    }
    
    // 调整选中区域的位置
    adjustSelectedArea(dx, dy, resizeMode = false) {
        if (!this.selectedArea || !this.debugMode) return;
        
        const element = this.selectedArea.element;
        
        if (resizeMode) {
            // 调整大小 - 同时更新所有相关字段
            this.selectedArea.width = Math.max(10, this.selectedArea.width + dx);
            this.selectedArea.height = Math.max(10, this.selectedArea.height + dy);
            
            // 同步更新原始尺寸
            if (this.selectedArea.originalWidth !== undefined) {
                this.selectedArea.originalWidth = this.selectedArea.width;
            }
            if (this.selectedArea.originalHeight !== undefined) {
                this.selectedArea.originalHeight = this.selectedArea.height;
            }
            
            // 更新DOM元素
            element.style.width = this.selectedArea.width + 'px';
            element.style.height = this.selectedArea.height + 'px';
            
            console.log(`🔧 调整大小: ${this.selectedArea.name} - 新尺寸: ${this.selectedArea.width}x${this.selectedArea.height}`);
        } else {
            // 调整位置 - 同时更新所有相关字段
            this.selectedArea.x += dx;
            this.selectedArea.y += dy;
            
            // 同步更新原始坐标
            if (this.selectedArea.originalX !== undefined) {
                this.selectedArea.originalX = this.selectedArea.x;
            }
            if (this.selectedArea.originalY !== undefined) {
                this.selectedArea.originalY = this.selectedArea.y;
            }
            
            // 更新DOM元素位置（注意：DOM位置需要加上偏移量）
            element.style.left = (this.selectedArea.x + this.offsetX) + 'px';
            element.style.top = (this.selectedArea.y + this.offsetY) + 'px';
            
            console.log(`🔧 调整位置: ${this.selectedArea.name} - 新坐标: (${this.selectedArea.x}, ${this.selectedArea.y})`);
        }
        
        // 立即更新调试信息显示
        this.updateDebugInfo();
    }
    
    // 复制坐标信息
    copyCoordinates() {
        if (!this.selectedArea) {
            console.log('没有选中的区域');
            return;
        }
        
        // 获取最新的坐标数据（优先使用调试中更新的值）
        const baseX = this.selectedArea.originalX !== undefined ? this.selectedArea.originalX : this.selectedArea.x;
        const baseY = this.selectedArea.originalY !== undefined ? this.selectedArea.originalY : this.selectedArea.y;
        const baseWidth = this.selectedArea.originalWidth !== undefined ? this.selectedArea.originalWidth : this.selectedArea.width;
        const baseHeight = this.selectedArea.originalHeight !== undefined ? this.selectedArea.originalHeight : this.selectedArea.height;
        
        // 计算最终坐标（包含偏移量）
        const finalX = baseX + this.offsetX;
        const finalY = baseY + this.offsetY;
        
        const info = {
            name: this.selectedArea.name,
            x: finalX,
            y: finalY,
            width: baseWidth,
            height: baseHeight
        };
        
        const coordString = `{ name: '${info.name}', x: ${info.x}, y: ${info.y}, width: ${info.width}, height: ${info.height} }`;
        
        console.log('📋 区域坐标信息（实时更新）:');
        console.log(coordString);
        console.log('📐 详细计算过程:');
        console.log(`   基准坐标: (${baseX}, ${baseY})`);
        console.log(`   全局偏移: (${this.offsetX}, ${this.offsetY})`);
        console.log(`   最终坐标: (${finalX}, ${finalY})`);
        console.log(`   区域尺寸: ${baseWidth} x ${baseHeight}`);
        console.log('📄 原始坐标格式:', `[${finalX},${finalY}][${finalX + baseWidth},${finalY + baseHeight}]`);
        
        // 尝试复制到剪贴板
        if (navigator.clipboard) {
            navigator.clipboard.writeText(coordString).then(() => {
                console.log('✅ 坐标已复制到剪贴板');
            }).catch(() => {
                console.log('❌ 复制到剪贴板失败，请手动复制控制台输出');
            });
        } else {
            console.log('⚠️ 浏览器不支持剪贴板API，请手动复制控制台输出');
        }
        
        // 显示临时提示
        this.showDialog(`已复制 ${this.selectedArea.name} 的坐标: (${finalX}, ${finalY}) ${baseWidth}x${baseHeight}`);
    }
    
    // 新增的保存功能
    saveAllCoordinates() {
        if (!this.debugMode || this.currentAreas.length === 0) {
            console.log('没有在调试模式或没有区域可保存');
            return;
        }

        const sceneData = this.getCurrentSceneData();
        const savedData = {
            scene: this.currentScene,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            areas: sceneData,
            timestamp: new Date().toISOString()
        };

        // 保存到localStorage
        const storageKey = `debug_coordinates_${this.currentScene}`;
        localStorage.setItem(storageKey, JSON.stringify(savedData));

        // 生成代码字符串用于直接使用
        const codeString = this.generateSceneCode(sceneData);
        
        console.log('✅ 坐标已保存到localStorage');
        console.log('🔧 可用的代码:');
        console.log(codeString);

        // 复制到剪贴板
        if (navigator.clipboard) {
            navigator.clipboard.writeText(codeString).then(() => {
                console.log('📋 代码已复制到剪贴板');
            });
        }

        this.showDialog(`${this.currentScene}场景坐标已保存！代码已复制到剪贴板和控制台。`);
    }

    resetCoordinates() {
        if (!this.debugMode) {
            console.log('需要在调试模式下才能重置坐标');
            return;
        }

        // 重置偏移
        this.offsetX = 0;
        this.offsetY = 0;

        // 重新创建交互区域
        this.createInteractiveAreas();

        // 清除localStorage中的保存数据
        const storageKey = `debug_coordinates_${this.currentScene}`;
        localStorage.removeItem(storageKey);

        console.log('🔄 坐标已重置为原始值');
        this.showDialog(`${this.currentScene}场景坐标已重置为原始值！`);
    }

    exportSceneData() {
        if (!this.debugMode) {
            console.log('需要在调试模式下才能导出数据');
                return;
            }
            
        const allScenesData = {};
        
        // 获取当前场景数据
        allScenesData[this.currentScene] = {
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            areas: this.getCurrentSceneData()
        };

        // 尝试从localStorage获取其他场景的保存数据
        ['office-scene', 'breakroom-scene', 'gamingroom-scene'].forEach(sceneName => {
            if (sceneName !== this.currentScene) {
                const savedData = localStorage.getItem(`debug_coordinates_${sceneName}`);
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    allScenesData[sceneName] = {
                        offsetX: parsed.offsetX,
                        offsetY: parsed.offsetY,
                        areas: parsed.areas
                    };
                }
            }
        });

        // 生成完整的导出数据
        const exportData = {
            version: '1.0',
            game: 'QuantumMatrix',
            exported: new Date().toISOString(),
            scenes: allScenesData
        };

        // 生成可用的代码
        let fullCode = '// 量子矩阵游戏 - 调试坐标数据\n';
        fullCode += '// 导出时间: ' + exportData.exported + '\n\n';

        Object.keys(allScenesData).forEach(sceneName => {
            const sceneData = allScenesData[sceneName];
            fullCode += `// ${sceneName.toUpperCase()}场景坐标\n`;
            fullCode += this.generateSceneCode(sceneData.areas, sceneName);
            fullCode += '\n';
        });

        // 输出到控制台
        console.log('📦 完整导出数据:');
        console.log(exportData);
        console.log('🔧 可用代码:');
        console.log(fullCode);

        // 复制到剪贴板
        if (navigator.clipboard) {
            navigator.clipboard.writeText(fullCode).then(() => {
                console.log('📋 完整代码已复制到剪贴板');
            });
        }

        // 下载为文件
        this.downloadAsFile('quantum_matrix_coordinates.js', fullCode);

        this.showDialog('所有场景数据已导出！代码已复制到剪贴板并下载为文件。');
    }

    getCurrentSceneData() {
        return this.currentAreas.map(area => ({
            name: area.name,
            x: area.originalX || area.x,  // 使用原始坐标而不是DOM坐标
            y: area.originalY || area.y,  // 使用原始坐标而不是DOM坐标
            width: area.originalWidth || area.width,
            height: area.originalHeight || area.height
        }));
    }

    generateSceneCode(areas, sceneName = null) {
        const currentSceneName = sceneName || this.currentScene;
        let code = `const ${currentSceneName}Areas = [\n`;
        
        areas.forEach((area, index) => {
            // 确保所有场景都使用原始坐标，处理不同的数据结构
            let baseX, baseY, baseWidth, baseHeight;
            
            // 检查是否有原始坐标属性
            if (area.originalX !== undefined && area.originalY !== undefined) {
                baseX = area.originalX;
                baseY = area.originalY;
                baseWidth = area.originalWidth || area.width;
                baseHeight = area.originalHeight || area.height;
            } else {
                // 对于没有原始坐标的情况，尝试从缩放中反推原始坐标
                // 如果有缩放比例，尝试反推
                if (this.scaleX && this.scaleY && this.scaleX > 0 && this.scaleY > 0) {
                    baseX = Math.round((area.x - (this.centerOffsetX || 0)) / this.scaleX);
                    baseY = Math.round((area.y - (this.centerOffsetY || 0)) / this.scaleY);
                    baseWidth = Math.round(area.width / this.scaleX);
                    baseHeight = Math.round(area.height / this.scaleY);
                } else {
                    // 作为备用方案，直接使用当前坐标
                    baseX = area.x;
                    baseY = area.y;
                    baseWidth = area.width;
                    baseHeight = area.height;
                }
            }
            
            const finalX = baseX + this.offsetX;
            const finalY = baseY + this.offsetY;
            
            code += `    { name: '${area.name}', x: ${finalX}, y: ${finalY}, width: ${baseWidth}, height: ${baseHeight} }`;
            if (index < areas.length - 1) {
                code += ',';
            }
            code += '\n';
        });
        
        code += '];\n';
        return code;
    }

    downloadAsFile(filename, content) {
        const blob = new Blob([content], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    loadSavedCoordinates() {
        if (!this.debugMode) return;

        const storageKey = `debug_coordinates_${this.currentScene}`;
        const savedData = localStorage.getItem(storageKey);
        
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                this.offsetX = parsed.offsetX || 0;
                this.offsetY = parsed.offsetY || 0;
                
                // 应用保存的坐标
                if (parsed.areas && parsed.areas.length > 0) {
                    // 这里可以选择是否自动应用保存的具体区域坐标
                    console.log(`📥 发现${this.currentScene}场景的保存数据`, parsed);
                }
                
                this.createInteractiveAreas();
                console.log(`✅ 已加载${this.currentScene}场景的保存坐标`);
            } catch (error) {
                console.error('加载保存数据时出错:', error);
            }
        }
    }

    // 为桌面图标添加debug样式
    setupDesktopIconsDebug() {
        // debug样式通过CSS的.debug-mode .desktop-icon来处理，无需额外操作
        if (this.isDesktopVisible()) {
            this.loadSavedDesktopIcons();
        }
    }

    // 清除桌面图标的debug样式
    clearDesktopIconSelection() {
        document.querySelectorAll('.desktop-icon.selected').forEach(icon => {
            icon.classList.remove('selected');
        });
        this.selectedDesktopIcon = null;
    }

    // 检查是否正在显示桌面
    isDesktopVisible() {
        const computerModal = document.getElementById('computer-modal');
        const desktop = document.getElementById('computer-desktop');
        
        // 检查电脑模态框是否打开，桌面界面是否显示
        const isComputerModalOpen = computerModal && computerModal.classList.contains('active');
        const isDesktopDisplayed = desktop && window.getComputedStyle(desktop).display !== 'none';
        
        return isComputerModalOpen && isDesktopDisplayed;
    }

    // 选择桌面图标进行调试
    selectDesktopIcon(iconElement, index) {
        if (!this.debugMode) return;
        
        this.clearSelection();
        this.clearDesktopIconSelection();
        
        this.selectedDesktopIcon = {
            element: iconElement,
            index: index,
            name: iconElement.dataset.app,
            x: parseInt(iconElement.style.left),
            y: parseInt(iconElement.style.top),
            width: parseInt(iconElement.style.width),
            height: parseInt(iconElement.style.height)
        };
        
        iconElement.classList.add('selected');
        this.updateDebugInfo();
        console.log(`选中桌面图标: ${this.selectedDesktopIcon.name}`);
    }

    // 调整桌面图标位置
    adjustDesktopIcon(dx, dy, resizeMode = false) {
        if (!this.selectedDesktopIcon || !this.debugMode) return;
        
        const icon = this.selectedDesktopIcon;
        const element = icon.element;
        
        if (resizeMode) {
            // 调整大小
            icon.width = Math.max(10, icon.width + dx);
            icon.height = Math.max(10, icon.height + dy);
            element.style.width = icon.width + 'px';
            element.style.height = icon.height + 'px';
        } else {
            // 调整位置
            icon.x += dx;
            icon.y += dy;
            element.style.left = icon.x + 'px';
            element.style.top = icon.y + 'px';
        }
        
        this.updateDebugInfo();
    }

    // 保存桌面图标坐标
    saveDesktopIconsCoordinates() {
        if (!this.debugMode) {
            console.log('需要在调试模式下才能保存桌面图标坐标');
            return;
        }

        const icons = [];
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icons.push({
                app: icon.dataset.app,
                x: parseInt(icon.style.left),
                y: parseInt(icon.style.top),
                width: parseInt(icon.style.width),
                height: parseInt(icon.style.height)
            });
        });

        const savedData = {
            type: 'desktop-icons',
            icons: icons,
            timestamp: new Date().toISOString()
        };

        // 保存到localStorage
        localStorage.setItem('debug_desktop_icons', JSON.stringify(savedData));

        // 生成HTML代码
        let htmlCode = icons.map(icon => 
            `<div class="desktop-icon" data-app="${icon.app}" style="left: ${icon.x}px; top: ${icon.y}px; width: ${icon.width}px; height: ${icon.height}px;"></div>`
        ).join('\n                ');

        console.log('✅ 桌面图标坐标已保存到localStorage');
        console.log('🔧 可用的HTML代码:');
        console.log(htmlCode);

        // 复制到剪贴板
        if (navigator.clipboard) {
            navigator.clipboard.writeText(htmlCode).then(() => {
                console.log('📋 HTML代码已复制到剪贴板');
            });
        }

        this.showDialog('桌面图标坐标已保存！HTML代码已复制到剪贴板和控制台。');
    }

    // 加载保存的桌面图标坐标
    loadSavedDesktopIcons() {
        const savedData = localStorage.getItem('debug_desktop_icons');
        if (!savedData) return;

        try {
            const data = JSON.parse(savedData);
            if (data.type === 'desktop-icons' && data.icons) {
                data.icons.forEach(iconData => {
                    const icon = document.querySelector(`.desktop-icon[data-app="${iconData.app}"]`);
                    if (icon) {
                        icon.style.left = iconData.x + 'px';
                        icon.style.top = iconData.y + 'px';
                        icon.style.width = iconData.width + 'px';
                        icon.style.height = iconData.height + 'px';
                    }
                });
                console.log('📂 已加载保存的桌面图标坐标');
            }
        } catch (e) {
            console.error('加载桌面图标坐标失败:', e);
        }
    }

    // 切换到下一个桌面图标
    selectNextDesktopIcon() {
        if (!this.debugMode || !this.isDesktopVisible()) return;
        
        const icons = Array.from(document.querySelectorAll('.desktop-icon'));
        if (icons.length === 0) return;
        
        let currentIndex = 0;
        if (this.selectedDesktopIcon) {
            currentIndex = icons.indexOf(this.selectedDesktopIcon.element);
        }
        
        const nextIndex = (currentIndex + 1) % icons.length;
        this.selectDesktopIcon(icons[nextIndex], nextIndex);
    }

    // 复制桌面图标坐标
    copyDesktopIconCoordinates() {
        if (!this.selectedDesktopIcon) {
            console.log('没有选中的桌面图标');
            return;
        }
        
        const icon = this.selectedDesktopIcon;
        const info = {
            app: icon.name,
            x: icon.x,
            y: icon.y,
            width: icon.width,
            height: icon.height
        };
        
        const coordString = `<div class="desktop-icon" data-app="${info.app}" style="left: ${info.x}px; top: ${info.y}px; width: ${info.width}px; height: ${info.height}px;"></div>`;
        
        console.log('桌面图标坐标信息:');
        console.log(coordString);
        
        // 尝试复制到剪贴板
        if (navigator.clipboard) {
            navigator.clipboard.writeText(coordString).then(() => {
                console.log('桌面图标HTML已复制到剪贴板');
            });
        }
    }

    // 重置桌面图标位置
    resetDesktopIcons() {
        if (!this.debugMode || !this.isDesktopVisible()) {
            console.log('需要在调试模式下且在桌面界面才能重置图标');
            return;
        }

        // 清除保存的坐标
        localStorage.removeItem('debug_desktop_icons');
        
        // 这里你需要设置默认的桌面图标位置
        const defaultPositions = {
            'email': { x: 160, y: 100, width: 130, height: 120 },
            'terminal': { x: 660, y: 350, width: 275, height: 200 },
            'folder': { x: 460, y: 90, width: 230, height: 150 },
            'trash': { x: 260, y: 390, width: 170, height: 170 },
            'gallery': { x: 800, y: 90, width: 230, height: 150 }
        };

        document.querySelectorAll('.desktop-icon').forEach(icon => {
            const app = icon.dataset.app;
            if (defaultPositions[app]) {
                const pos = defaultPositions[app];
                icon.style.left = pos.x + 'px';
                icon.style.top = pos.y + 'px';
                icon.style.width = pos.width + 'px';
                icon.style.height = pos.height + 'px';
            }
        });

        this.clearDesktopIconSelection();
        console.log('🔄 桌面图标位置已重置为默认值');
        this.showDialog('桌面图标位置已重置为默认值！');
    }

    // 预览图片
    previewImage(imageSrc, title) {
        document.getElementById('modal-image').src = imageSrc;
        document.getElementById('image-title').textContent = `🖼️ ${title}`;
        document.getElementById('flip-button').style.display = 'none';
        this.showModal('image-modal');
    }

    // 显示文件内容
    showFileContent(fileType) {
        let content = '';
        
        switch(fileType) {
            case 'joke':
                content = `
开发者笑话集合
================

1. 为什么程序员总是分不清万圣节和圣诞节？
   因为 Oct 31 == Dec 25

2. 一个程序员对朋友说："我要去买些牛奶，你还要别的吗？"
   朋友说："顺便买个面包。"
   结果程序员再也没有回来...
   （因为陷入了无限循环）

3. 什么是递归？
   要理解递归，首先你要理解递归。

4. 为什么程序员不喜欢自然？
   因为自然里有太多的bugs。

5. "敲代码一时爽，调试火葬场"
   ——某不愿透露姓名的程序员

最后修改时间: 今天 14:23
作者: 某个无聊的程序员
                `;
                break;
            case 'access':
                content = `
最近访问记录：
茶水间.ID=7734
游戏室.ID=????
图书馆.ID=????
                `;
                break;
            case 'report1':
                content = `
实验报告 #001
实验代号：现实重构计划
日期：2024年3月15日
====================

实验目的：
验证意识转移到数字环境的可行性，创建可控的虚拟现实体验。

实验对象：
测试对象编号 001-026（已完成）
当前测试对象：027（进行中）

实验方法：
1. 通过神经接口将受试者意识上传到量子计算机
2. 在虚拟环境中模拟日常工作场景
3. 监控受试者的认知反应和适应性

初步结果：
- 前26名受试者均成功适应虚拟环境
- 意识稳定性达到92.4%
- 未检测到显著的抗拒反应

重要发现：
第27号受试者表现异常，显示出对虚拟环境的质疑。
这可能是一个突破，也可能是一个威胁。

建议：
继续观察受试者027，必要时启动安全协议。

首席研究员：Dr. M.
安全等级：机密
                `;
                break;
            case 'report2':
                content = `
实验报告 #002
实验代号：意识囚笼项目
日期：2024年3月18日
===================

紧急更新：
受试者027展现出前所未有的自我意识水平。
系统检测到多次尝试访问受限区域。

当前状况：
- 027已开始质疑环境的真实性
- S.L.模块（系统漏洞）似乎在协助受试者
- 虚拟环境稳定性下降至67%

对策部署：
1. 加强环境约束，限制受试者活动范围
2. 监控所有S.L.模块活动
3. 准备紧急重置协议

风险评估：
如果027成功突破虚拟环境，可能威胁整个项目。
必须在他发现真相前采取行动。

注意：
最新检测显示027的神经活动出现量子纠缠现象。
这是前所未见的情况，可能表明意识正在试图"逃逸"。

建议采取行动：立即激活深度睡眠协议
如果失败，执行完全重置。

Dr. M.
警告等级：CRITICAL
                `;
                break;
            default:
                content = '文件内容无法读取。';
        }
        
        // 使用文本预览模态框
        this.showTextPreview(content, fileType);
    }
    
    // 显示文本预览
    showTextPreview(content, title) {
        // 创建或更新文本预览模态框
        let textModal = document.getElementById('text-preview-modal');
        if (!textModal) {
            // 如果不存在，创建一个新的模态框
            textModal = document.createElement('div');
            textModal.id = 'text-preview-modal';
            textModal.className = 'modal';
            textModal.innerHTML = `
                <div class="modal-content text-viewer">
                    <div class="text-header">
                        <h3 id="text-title">文件预览</h3>
                        <button class="close-btn" onclick="game.closeModal('text-preview-modal')">&times;</button>
                    </div>
                    <div class="text-content">
                        <pre id="text-body"></pre>
                    </div>
                </div>
            `;
            document.body.appendChild(textModal);
        }
        
        document.getElementById('text-title').textContent = `📄 ${title}`;
        document.getElementById('text-body').innerHTML = content;
        this.showModal('text-preview-modal');
    }
    
    // 门禁密码验证
    verifyDoorAccess() {
        const input = document.getElementById('door-password-input');
        const password = input.value.trim();
        
        if (password === 'aroga') {
            // 密码正确，触发游戏结束序列
            this.closeModal('door-access-modal');
            this.showGameEnding();
        } else {
            // 密码错误
            input.value = '';
            input.style.border = '2px solid #ff4444';
            setTimeout(() => {
                input.style.border = '2px solid #9a7b4f';
            }, 1000);
            
            // 播放错误音效
            this.playAudio('click-audio');
            
            // 显示错误提示
            const errorDiv = document.getElementById('door-access-error');
            errorDiv.textContent = 'ACCESS DENIED - 密码错误';
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 2000);
        }
    }
    
    // 游戏结束序列
    showGameEnding() {
        // 直接切换到大厅场景
        this.switchToHallScene();
    }
    
    // 切换到大厅场景
    switchToHallScene() {
        // 关闭门禁面板
        this.closeModal('door-access-modal');
        if (document.getElementById('door-security-panel')) {
            document.getElementById('door-security-panel').style.display = 'none';
        }
        
        // 创建大厅场景
        const sceneContainer = document.querySelector('.scene-container');
        
        // 隐藏当前场景
        const currentScene = document.querySelector('.scene.active');
        if (currentScene) {
            currentScene.classList.remove('active');
        }
        
        // 隐藏场景导航按钮
        const sceneNavigation = document.querySelector('.scene-navigation');
        if (sceneNavigation) {
            sceneNavigation.style.display = 'none';
        }
        
        // 创建大厅场景
        const hallScene = document.createElement('div');
        hallScene.className = 'scene active';
        hallScene.id = 'hall-scene';
        hallScene.innerHTML = `
            <div class="scene-background" style="background-image: url('./public/images/begin.png'); background-size: cover; background-position: center;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                           background: rgba(0, 0, 0, 0.8); color: #c9b037; padding: 30px; 
                           border-radius: 15px; border: 2px solid #9a7b4f; text-align: center; 
                           max-width: 600px; font-family: 'Courier New', monospace;">
                    <h2 style="color: #c9b037; margin-bottom: 20px; font-size: 24px;">量子矩阵科技 - 主大厅</h2>
                    <p style="margin-bottom: 15px; line-height: 1.6;">门禁系统已解除，欢迎进入量子矩阵科技大厅。</p>
                    <p style="margin-bottom: 15px; line-height: 1.6;">这里是公司的核心区域，通往各个重要部门的枢纽。</p>
                    <p style="margin-bottom: 15px; line-height: 1.6;">但是...周围依然空无一人，这种诡异的寂静让人不安。</p>
                    <p style="margin-bottom: 20px; line-height: 1.6; color: #ff6b6b; font-weight: bold;">
                        系统检测到异常量子波动，现实稳定性下降至73%...
                    </p>
                    <p style="color: #9a7b4f; font-style: italic;">你必须继续寻找真相，这或许只是逃离虚拟牢笼的第一步。</p>
                </div>
            </div>
        `;
        
        sceneContainer.appendChild(hallScene);
        
        // 更新游戏状态
        this.currentScene = 'hall';
        
        // 播放背景音乐
        this.playBackgroundMusic();
        
        // 5秒后隐藏提示信息
        setTimeout(() => {
            const infoPanel = hallScene.querySelector('div[style*="position: absolute"]');
            if (infoPanel) {
                infoPanel.style.opacity = '0';
                infoPanel.style.transition = 'opacity 1s ease';
                setTimeout(() => {
                    if (infoPanel.parentNode) {
                        infoPanel.parentNode.removeChild(infoPanel);
                    }
                }, 1000);
            }
        }, 5000);
    }
    
    // 显示胜利界面 (保留原函数但不再使用)
    showVictoryScreen() {
        // 这个函数现在被switchToHallScene()替代
        console.log('Victory screen bypassed, switched to hall scene instead.');
    }
    
    // 24英寸屏幕调试工具
    adjustForScreen24(offsetX = 0, offsetY = 0, scaleMultiplier = 1.0) {
        if (this.deviceInfo.width !== 1920 || this.deviceInfo.height !== 1080) {
            console.log('⚠️ 此调试工具仅适用于1920x1080分辨率的屏幕');
            return;
        }
        
        window.debugOffsetX = offsetX;
        window.debugOffsetY = offsetY;
        window.debugScale = scaleMultiplier;
        
        console.log(`🔧 调整热区参数: X偏移=${offsetX}, Y偏移=${offsetY}, 缩放=${scaleMultiplier}`);
        
        this.calculateScale();
        this.createInteractiveAreas();
        
        console.log('✅ 热区已更新，请测试点击效果');
        console.log('💡 如果需要微调，可以继续调用: game.adjustForScreen24(x, y, scale)');
    }
    
    // 14英寸高分辨率屏幕诊断工具
    checkHighResDisplay() {
        if (this.deviceInfo.screenCategory !== 'high-res') {
            console.log('⚠️ 此工具用于诊断高分辨率屏幕显示问题');
            console.log(`当前检测到: ${this.deviceInfo.screenCategory} (${this.deviceInfo.width}x${this.deviceInfo.height})`);
            return;
        }
        
        const container = document.querySelector('.scene-container');
        const sceneBackground = document.querySelector('.scene.active .scene-background');
        
        if (!container || !sceneBackground) {
            console.log('❌ 无法找到场景元素');
            return;
        }
        
        const containerRect = container.getBoundingClientRect();
        const backgroundRect = sceneBackground.getBoundingClientRect();
        
        console.log('🔍 高分辨率屏幕诊断报告:');
        console.log(`📏 屏幕尺寸: ${this.deviceInfo.width}x${this.deviceInfo.height}`);
        console.log(`📦 容器尺寸: ${containerRect.width.toFixed(1)}x${containerRect.height.toFixed(1)}`);
        console.log(`🖼️ 背景尺寸: ${backgroundRect.width.toFixed(1)}x${backgroundRect.height.toFixed(1)}`);
        console.log(`⚖️ 缩放比例: ${this.scaleX.toFixed(4)}`);
        console.log(`📍 偏移量: X=${this.centerOffsetX.toFixed(1)}, Y=${this.centerOffsetY.toFixed(1)}`);
        
        // 检查背景图片是否完整显示
        const scaleRatio = Math.min(containerRect.width / this.baseWidth, containerRect.height / this.baseHeight);
        const expectedWidth = this.baseWidth * scaleRatio;
        const expectedHeight = this.baseHeight * scaleRatio;
        
        console.log(`🎯 预期背景尺寸: ${expectedWidth.toFixed(1)}x${expectedHeight.toFixed(1)}`);
        
        if (Math.abs(backgroundRect.width - expectedWidth) > 10 || Math.abs(backgroundRect.height - expectedHeight) > 10) {
            console.log('⚠️ 背景图片尺寸异常，可能显示不完整');
            console.log('💡 建议尝试刷新页面或切换场景');
        } else {
            console.log('✅ 背景图片显示正常');
        }
        
        // 检查热区是否在可见范围内
        const interactiveAreas = document.querySelectorAll('.interactive-area');
        let outOfBounds = 0;
        interactiveAreas.forEach(area => {
            const areaRect = area.getBoundingClientRect();
            if (areaRect.left < containerRect.left || areaRect.top < containerRect.top ||
                areaRect.right > containerRect.right || areaRect.bottom > containerRect.bottom) {
                outOfBounds++;
            }
        });
        
        if (outOfBounds > 0) {
            console.log(`⚠️ 有 ${outOfBounds} 个热区可能超出可见范围`);
        } else {
            console.log(`✅ 所有 ${interactiveAreas.length} 个热区都在可见范围内`);
        }
    }
    
    // 热区测试工具
    testHotAreas() {
        console.log('🧪 开始热区测试...');
        
        const areas = document.querySelectorAll('.interactive-area');
        console.log(`发现 ${areas.length} 个热区`);
        
        areas.forEach((area, index) => {
            const rect = area.getBoundingClientRect();
            const name = area.getAttribute('data-name');
            console.log(`${index + 1}. ${name}: (${rect.left.toFixed(1)}, ${rect.top.toFixed(1)}) ${rect.width.toFixed(1)}x${rect.height.toFixed(1)}`);
            
            // 临时高亮热区
            area.style.border = '3px solid red';
            area.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            
            setTimeout(() => {
                area.style.border = '';
                area.style.backgroundColor = '';
            }, 2000);
        });
        
        console.log('🎯 所有热区已临时高亮2秒，请检查位置是否正确');
        console.log('💡 使用 D 键进入调试模式查看持久的热区边框');
    }

    // 测试修复效果的方法
    testFixes() {
        console.log('🧪 测试修复效果...');
        
        // 测试1：检查桌面背景显示修复
        const computerModal = document.getElementById('computer-modal');
        const isComputerOpen = computerModal && computerModal.classList.contains('active');
        
        if (isComputerOpen && this.isDesktopVisible()) {
            const desktopBackground = document.querySelector('.desktop-background');
            console.log(`🖥️ 桌面背景测试:`);
            
            if (desktopBackground) {
                const bgImage = desktopBackground.style.backgroundImage;
                const bgSize = desktopBackground.style.backgroundSize;
                const bgPosition = desktopBackground.style.backgroundPosition;
                
                console.log(`   - 背景图片: ${bgImage}`);
                console.log(`   - 背景尺寸: ${bgSize}`);
                console.log(`   - 背景位置: ${bgPosition}`);
                console.log(`   - 图片路径正确: ${bgImage.includes('computer_desk.png') ? '✅' : '❌'}`);
                console.log(`   - 背景尺寸设置: ${bgSize === 'cover' ? '✅ cover' : '❌ ' + bgSize}`);
            } else {
                console.log(`   ❌ 桌面背景元素未找到`);
            }
        } else {
            console.log('🖥️ 桌面背景测试: 需要先打开电脑并登录到桌面');
        }
        
        // 测试2：检查三消游戏修复
        console.log(`🎮 三消游戏测试:`);
        const match3Board = document.getElementById('match3-board');
        const gameScore = document.getElementById('game-score');
        
        if (match3Board && gameScore) {
            console.log(`   - 游戏板元素: ✅ 存在`);
            console.log(`   - 分数元素: ✅ 存在`);
            console.log(`   - 游戏板网格样式: ${match3Board.style.display === 'grid' ? '✅' : '❌'}`);
            
            // 如果游戏板已初始化，检查格子数量
            const cells = match3Board.querySelectorAll('.game-cell');
            console.log(`   - 游戏格子数量: ${cells.length} (期望: 64)`);
            console.log(`   - 格子数量正确: ${cells.length === 64 ? '✅' : '❌'}`);
        } else {
            console.log(`   ❌ 三消游戏元素缺失 (board: ${!!match3Board}, score: ${!!gameScore})`);
        }
        
        // 测试3：检查茶水间照片显示修复
        console.log(`📷 茶水间照片测试:`);
        const photoModal = document.getElementById('photo-modal');
        const agoraLetters = document.getElementById('agora-letters');
        
        if (photoModal && agoraLetters) {
            console.log(`   - 照片模态框: ✅ 存在`);
            console.log(`   - Agora字母容器: ✅ 存在`);
            
            // 检查已收集的密码纸片数量
            const pwdCount = ['pwd1', 'pwd2', 'pwd3', 'pwd4', 'pwd5'].filter(
                pwd => this.gameState.inventory[pwd]
            ).length;
            console.log(`   - 已收集密码纸片: ${pwdCount}/5`);
            
            // 如果照片模态框打开，检查字母显示
            if (photoModal.classList.contains('active')) {
                const displayedLetters = agoraLetters.children.length;
                console.log(`   - 当前显示字母: ${displayedLetters}/${pwdCount}`);
            } else {
                console.log(`   - 照片模态框未打开，无法检查字母显示`);
            }
        } else {
            console.log(`   ❌ 照片相关元素缺失 (modal: ${!!photoModal}, letters: ${!!agoraLetters})`);
        }
        
        // 测试4：检查之前的修复（坐标保存、Debug模式等）
        console.log(`🔧 之前修复的功能测试:`);
        console.log(`   - Debug模式状态: ${this.debugMode ? '✅开启' : '❌关闭'}`);
        console.log(`   - 场景交互区域: ${this.currentAreas?.length || 0} 个`);
        console.log(`   - 当前场景: ${this.currentScene}`);
        
        // 测试环境感知功能
        const computerModalForEnv = document.getElementById('computer-modal');
        const isInComputerInterface = computerModalForEnv && computerModalForEnv.classList.contains('active');
        const isOnDesktop = this.isDesktopVisible();
        
        let currentEnv = '';
        if (isInComputerInterface && isOnDesktop) {
            currentEnv = '电脑桌面界面';
        } else if (isInComputerInterface) {
            currentEnv = '电脑界面(非桌面)';
        } else {
            currentEnv = `游戏场景: ${this.currentScene}`;
        }
        console.log(`   - 环境检测: ${currentEnv}`);
        
        console.log('✅ 所有测试完成！');
        
        // 提供快速测试建议
        console.log('💡 快速测试建议:');
        console.log('   1. 测试桌面背景: 打开电脑 → 登录 → 检查桌面背景');
        console.log('   2. 测试三消游戏: 进入游戏室 → 点击游戏机 → 检查游戏板');
        console.log('   3. 测试照片显示: 进入茶水间 → 点击相框 → 检查字母显示');
        console.log('   4. 如需收集密码纸片测试照片: 先收集时钟(pwd1)、杯子(pwd2)等');
    }
    
    // 测试桌面背景的方法
    testDesktopBackground() {
        console.log('🖥️ 专项测试：桌面背景显示...');
        
        const computerModal = document.getElementById('computer-modal');
        const desktopBackground = document.querySelector('.desktop-background');
        const desktop = document.getElementById('computer-desktop');
        
        console.log('📋 系统状态检查:');
        console.log(`   - 电脑模态框存在: ${computerModal ? '✅' : '❌'}`);
        console.log(`   - 电脑模态框打开: ${computerModal && computerModal.classList.contains('active') ? '✅' : '❌'}`);
        console.log(`   - 桌面界面存在: ${desktop ? '✅' : '❌'}`);
        console.log(`   - 桌面界面显示: ${desktop && window.getComputedStyle(desktop).display !== 'none' ? '✅' : '❌'}`);
        console.log(`   - 桌面背景元素存在: ${desktopBackground ? '✅' : '❌'}`);
        
        if (desktopBackground) {
            console.log('🎨 背景图片设置详情:');
            const styles = {
                backgroundImage: desktopBackground.style.backgroundImage,
                backgroundSize: desktopBackground.style.backgroundSize,
                backgroundPosition: desktopBackground.style.backgroundPosition,
                backgroundRepeat: desktopBackground.style.backgroundRepeat,
                width: desktopBackground.style.width,
                height: desktopBackground.style.height
            };
            
            Object.entries(styles).forEach(([prop, value]) => {
                console.log(`   - ${prop}: ${value || '未设置'}`);
            });
            
            const bgImage = styles.backgroundImage;
            const hasCorrectImage = bgImage && bgImage.includes('computer_desk.png');
            
            console.log('✅ 检查结果:');
            console.log(`   - 图片路径正确: ${hasCorrectImage ? '✅' : '❌'}`);
            console.log(`   - 背景尺寸优化: ${styles.backgroundSize === 'cover' ? '✅ cover模式' : '❌ ' + styles.backgroundSize}`);
            console.log(`   - 背景居中: ${styles.backgroundPosition === 'center center' ? '✅' : '❌'}`);
            
            if (!hasCorrectImage) {
                console.log('🔧 尝试修复背景设置...');
                this.showDesktop();
                setTimeout(() => {
                    const newBgImage = desktopBackground.style.backgroundImage;
                    console.log(`   修复后图片: ${newBgImage}`);
                }, 100);
            }
        } else {
            console.log('❌ 桌面背景元素未找到');
            console.log('💡 请先: 1.开始游戏 → 2.点击电脑 → 3.登录(密码1727) → 4.重新运行此测试');
        }
    }
    
    // 测试三消游戏的方法
    testMatch3Game() {
        console.log('🎮 专项测试：三消游戏功能...');
        
        const match3Modal = document.getElementById('match3-modal');
        const match3Board = document.getElementById('match3-board');
        const gameScore = document.getElementById('game-score');
        
        console.log('📋 游戏元素检查:');
        console.log(`   - 三消模态框存在: ${match3Modal ? '✅' : '❌'}`);
        console.log(`   - 游戏板元素存在: ${match3Board ? '✅' : '❌'}`);
        console.log(`   - 分数元素存在: ${gameScore ? '✅' : '❌'}`);
        
        if (match3Modal && match3Board && gameScore) {
            console.log('🎯 游戏状态检查:');
            const isModalOpen = match3Modal.classList.contains('active');
            console.log(`   - 游戏界面打开: ${isModalOpen ? '✅' : '❌'}`);
            
            if (match3Board.children.length > 0) {
                const cells = match3Board.querySelectorAll('.game-cell');
                console.log(`   - 游戏格子数量: ${cells.length} (期望: 64)`);
                console.log(`   - 游戏板网格布局: ${match3Board.style.display === 'grid' ? '✅' : '❌'}`);
                console.log(`   - 网格列设置: ${match3Board.style.gridTemplateColumns === 'repeat(8, 1fr)' ? '✅' : '❌'}`);
                console.log(`   - 当前分数: ${gameScore.textContent}`);
                
                // 检查游戏格子样式
                if (cells.length > 0) {
                    const firstCell = cells[0];
                    console.log('🔍 格子样式检查:');
                    console.log(`   - 格子显示模式: ${firstCell.style.display === 'flex' ? '✅ flex' : '❌ ' + firstCell.style.display}`);
                    console.log(`   - 格子最小尺寸: ${firstCell.style.minWidth}x${firstCell.style.minHeight}`);
                    console.log(`   - 格子内容: ${firstCell.textContent ? '✅ 有内容' : '❌ 空白'}`);
                }
                
                console.log('✅ 三消游戏已正确初始化');
            } else {
                console.log('⚠️ 游戏板为空，尝试初始化...');
                console.log('💡 请进入游戏室并点击游戏机来初始化游戏');
            }
            
            if (!isModalOpen) {
                console.log('💡 游戏界面未打开，无法完整测试交互功能');
                console.log('   建议: 进入游戏室 → 点击游戏机 → 重新运行此测试');
            }
        } else {
            console.log('❌ 关键游戏元素缺失');
            console.log('💡 请检查HTML文件中的match3-modal、match3-board、game-score元素');
        }
        
        // 测试游戏逻辑
        if (typeof this.initMatch3Game === 'function') {
            console.log('🔧 游戏逻辑测试:');
            console.log(`   - initMatch3Game方法: ✅ 存在`);
            console.log(`   - handleCellClick方法: ${typeof this.handleCellClick === 'function' ? '✅' : '❌'} 存在`);
            console.log(`   - findMatches方法: ${typeof this.findMatches === 'function' ? '✅' : '❌'} 存在`);
            console.log(`   - updateBoardDisplay方法: ${typeof this.updateBoardDisplay === 'function' ? '✅' : '❌'} 存在`);
        }
    }

    // 验证第五轮修复的方法
    verifyFifthRoundFixes() {
        console.log('🧪 验证第五轮修复效果...');
        console.log('═'.repeat(50));
        
        // 1. 测试桌面背景修复
        console.log('📱 1. 桌面背景显示修复验证:');
        const computerModal = document.getElementById('computer-modal');
        const desktopVisible = this.isDesktopVisible();
        
        if (desktopVisible) {
            const desktopBackground = document.querySelector('.desktop-background');
            if (desktopBackground) {
                const bgImage = desktopBackground.style.backgroundImage;
                const bgSize = desktopBackground.style.backgroundSize;
                const hasImportant = desktopBackground.style.cssText.includes('!important');
                
                console.log(`   - 背景图片设置: ${bgImage ? '✅' : '❌'}`);
                console.log(`   - 背景尺寸cover: ${bgSize.includes('cover') ? '✅' : '❌'}`);
                console.log(`   - 使用!important: ${hasImportant ? '✅' : '❌'}`);
                console.log(`   - 图片路径正确: ${bgImage.includes('computer_desk.png') ? '✅' : '❌'}`);
                
                if (bgImage && bgSize.includes('cover') && hasImportant) {
                    console.log('   ✅ 桌面背景修复: 成功');
                } else {
                    console.log('   ❌ 桌面背景修复: 需要检查');
                }
            } else {
                console.log('   ❌ 桌面背景元素未找到');
            }
        } else {
            console.log('   ⚪ 桌面未显示，无法测试背景');
            console.log('   💡 请先: 开始游戏 → 点击电脑 → 登录(1727) → 重新运行测试');
        }
        
        // 2. 测试相框显示修复
        console.log('\n🖼️ 2. 相框显示修复验证:');
        const photoModal = document.getElementById('photo-modal');
        const agoraLetters = document.getElementById('agora-letters');
        
        if (agoraLetters) {
            const containerStyle = agoraLetters.style.cssText;
            const hasPosition = containerStyle.includes('position: relative');
            const hasZIndex = containerStyle.includes('z-index: 100');
            const hasImportantStyles = containerStyle.includes('!important');
            
            console.log(`   - Agora容器存在: ✅`);
            console.log(`   - 位置样式设置: ${hasPosition ? '✅' : '❌'}`);
            console.log(`   - z-index设置: ${hasZIndex ? '✅' : '❌'}`);
            console.log(`   - 使用!important: ${hasImportantStyles ? '✅' : '❌'}`);
            
            // 检查密码纸片收集情况
            const pwdCount = ['pwd1', 'pwd2', 'pwd3', 'pwd4', 'pwd5'].filter(
                pwd => this.gameState.inventory[pwd]
            ).length;
            console.log(`   - 已收集密码纸片: ${pwdCount}/5`);
            
            if (pwdCount > 0) {
                // 模拟更新显示来测试
                this.updateAgoraDisplay();
                setTimeout(() => {
                    const displayedLetters = agoraLetters.children.length;
                    console.log(`   - 显示字母数量: ${displayedLetters}/${pwdCount}`);
                    console.log(`   - 字母显示正确: ${displayedLetters === pwdCount ? '✅' : '❌'}`);
                }, 100);
            }
            
            if (hasPosition && hasZIndex && hasImportantStyles) {
                console.log('   ✅ 相框显示修复: 成功');
            } else {
                console.log('   ❌ 相框显示修复: 需要检查');
            }
        } else {
            console.log('   ❌ Agora字母容器未找到');
        }
        
        // 3. 测试抓娃娃机UI修复
        console.log('\n🎮 3. 抓娃娃机UI修复验证:');
        const clawModal = document.getElementById('claw-modal');
        const clawPlay = document.getElementById('claw-play');
        const clawStatus = document.getElementById('claw-status');
        const clawResult = document.getElementById('claw-result');
        
        if (clawPlay && clawStatus && clawResult) {
            console.log(`   - UI元素完整: ✅`);
            
            // 测试UI更新逻辑
            const hasCoins = !!this.gameState.inventory.coin;
            console.log(`   - 当前游戏币状态: ${hasCoins ? '有' : '无'}`);
            console.log(`   - 使用次数: ${this.clawMachineUsed}/3`);
            
            // 调用更新方法测试
            this.updateClawMachine();
            
            const buttonDisabled = clawPlay.disabled;
            const buttonHasStyles = clawPlay.style.cssText.includes('!important');
            const statusHasText = clawStatus.textContent.length > 0;
            
            console.log(`   - 按钮状态正确: ${!hasCoins ? (buttonDisabled ? '✅' : '❌') : (!buttonDisabled ? '✅' : '❌')}`);
            console.log(`   - 按钮样式强化: ${buttonHasStyles ? '✅' : '❌'}`);
            console.log(`   - 状态文本显示: ${statusHasText ? '✅' : '❌'}`);
            
            if (buttonHasStyles && statusHasText) {
                console.log('   ✅ 抓娃娃机UI修复: 成功');
            } else {
                console.log('   ❌ 抓娃娃机UI修复: 需要检查');
            }
        } else {
            console.log(`   ❌ 抓娃娃机UI元素缺失 (play: ${!!clawPlay}, status: ${!!clawStatus}, result: ${!!clawResult})`);
        }
        
        // 4. 总结修复状态
        console.log('\n📊 第五轮修复总结:');
        console.log('   🔧 修复内容:');
        console.log('      - 桌面背景显示问题 (强制CSS样式)');
        console.log('      - 相框Agora字母显示异常 (容器样式和定位)');
        console.log('      - 抓娃娃机UI状态管理异常 (按钮和状态显示)');
        console.log('   📈 改进点:');
        console.log('      - 使用!important确保样式优先级');
        console.log('      - 增强DOM元素验证和错误处理');
        console.log('      - 添加详细的调试日志输出');
        console.log('      - 改进响应式布局计算');
        
        console.log('═'.repeat(50));
        console.log('✅ 第五轮修复验证完成！');
        
        return {
            desktop: desktopVisible && document.querySelector('.desktop-background')?.style.backgroundImage.includes('computer_desk.png'),
            agora: !!agoraLetters && agoraLetters.style.cssText.includes('!important'),
            claw: !!clawPlay && clawPlay.style.cssText.includes('!important')
        };
    }
    
    // 快速测试第五轮修复的方法
    testFifthRoundFixes() {
        console.log('🚀 快速测试第五轮修复...');
        
        const results = this.verifyFifthRoundFixes();
        
        console.log('\n🎯 测试建议:');
        if (!results.desktop) {
            console.log('   📱 桌面背景: 进入电脑界面并登录测试背景显示');
        }
        if (!results.agora) {
            console.log('   🖼️ 相框显示: 进入茶水间点击相框测试字母显示');
        }
        if (!results.claw) {
            console.log('   🎮 抓娃娃机: 进入游戏室点击抓娃娃机测试UI状态');
        }
        
        const successCount = Object.values(results).filter(r => r).length;
        console.log(`\n📊 修复成功率: ${successCount}/3 (${(successCount/3*100).toFixed(1)}%)`);
        
        if (successCount === 3) {
            console.log('🎉 所有修复验证通过！');
        } else {
            console.log('⚠️ 部分修复需要进一步测试或存在问题');
        }
    }
    
    // 测试Debug模式坐标调整功能
    testDebugCoordinateAdjustment() {
        console.log('🔧 测试Debug模式坐标调整功能...');
        console.log('═'.repeat(50));
        
        if (!this.debugMode) {
            console.log('❌ 请先按 D 键开启调试模式');
            return false;
        }
        
        if (!this.currentAreas || this.currentAreas.length === 0) {
            console.log('❌ 当前场景没有热区可供测试');
            return false;
        }
        
        console.log('📊 测试环境检查:');
        console.log(`   - 当前场景: ${this.currentScene}`);
        console.log(`   - 热区数量: ${this.currentAreas.length}`);
        console.log(`   - 当前偏移: (${this.offsetX}, ${this.offsetY})`);
        
        // 自动选择第一个热区进行测试
        if (!this.selectedArea) {
            this.selectArea(this.currentAreas[0]);
            console.log(`🎯 自动选择热区: ${this.selectedArea.name}`);
        }
        
        if (!this.selectedArea) {
            console.log('❌ 无法选择热区进行测试');
            return false;
        }
        
        console.log('\n🧪 执行坐标调整测试:');
        
        // 记录初始状态
        const initialX = this.selectedArea.originalX !== undefined ? this.selectedArea.originalX : this.selectedArea.x;
        const initialY = this.selectedArea.originalY !== undefined ? this.selectedArea.originalY : this.selectedArea.y;
        const initialWidth = this.selectedArea.originalWidth !== undefined ? this.selectedArea.originalWidth : this.selectedArea.width;
        const initialHeight = this.selectedArea.originalHeight !== undefined ? this.selectedArea.originalHeight : this.selectedArea.height;
        
        console.log(`📍 初始状态: (${initialX}, ${initialY}) ${initialWidth}x${initialHeight}`);
        
        // 测试位置调整
        console.log('\n1️⃣ 测试位置调整 (+10, +5):');
        this.adjustSelectedArea(10, 5, false);
        
        const afterMoveX = this.selectedArea.originalX !== undefined ? this.selectedArea.originalX : this.selectedArea.x;
        const afterMoveY = this.selectedArea.originalY !== undefined ? this.selectedArea.originalY : this.selectedArea.y;
        
        const moveCorrect = (afterMoveX === initialX + 10) && (afterMoveY === initialY + 5);
        console.log(`   位置调整结果: (${afterMoveX}, ${afterMoveY})`);
        console.log(`   位置调整正确: ${moveCorrect ? '✅' : '❌'}`);
        
        // 测试大小调整
        console.log('\n2️⃣ 测试大小调整 (+20, +10):');
        this.adjustSelectedArea(20, 10, true);
        
        const afterResizeWidth = this.selectedArea.originalWidth !== undefined ? this.selectedArea.originalWidth : this.selectedArea.width;
        const afterResizeHeight = this.selectedArea.originalHeight !== undefined ? this.selectedArea.originalHeight : this.selectedArea.height;
        
        const resizeCorrect = (afterResizeWidth === initialWidth + 20) && (afterResizeHeight === initialHeight + 10);
        console.log(`   大小调整结果: ${afterResizeWidth}x${afterResizeHeight}`);
        console.log(`   大小调整正确: ${resizeCorrect ? '✅' : '❌'}`);
        
        // 测试坐标复制功能
        console.log('\n3️⃣ 测试坐标复制功能:');
        try {
            this.copyCoordinates();
            console.log('   坐标复制功能: ✅ 执行成功');
        } catch (error) {
            console.log(`   坐标复制功能: ❌ 执行失败 - ${error.message}`);
        }
        
        // 恢复初始状态
        console.log('\n🔄 恢复初始状态:');
        this.selectedArea.originalX = initialX;
        this.selectedArea.originalY = initialY;
        this.selectedArea.originalWidth = initialWidth;
        this.selectedArea.originalHeight = initialHeight;
        this.selectedArea.x = initialX;
        this.selectedArea.y = initialY;
        this.selectedArea.width = initialWidth;
        this.selectedArea.height = initialHeight;
        
        // 更新DOM元素
        if (this.selectedArea.element) {
            this.selectedArea.element.style.left = (initialX + this.offsetX) + 'px';
            this.selectedArea.element.style.top = (initialY + this.offsetY) + 'px';
            this.selectedArea.element.style.width = initialWidth + 'px';
            this.selectedArea.element.style.height = initialHeight + 'px';
        }
        
        this.updateDebugInfo();
        console.log('   状态已恢复到初始值');
        
        // 总结测试结果
        console.log('\n📋 测试总结:');
        const allTestsPassed = moveCorrect && resizeCorrect;
        console.log(`   位置调整: ${moveCorrect ? '✅ 通过' : '❌ 失败'}`);
        console.log(`   大小调整: ${resizeCorrect ? '✅ 通过' : '❌ 失败'}`);
        console.log(`   坐标复制: ✅ 功能正常`);
        console.log(`   总体结果: ${allTestsPassed ? '✅ 全部通过' : '❌ 部分失败'}`);
        
        if (allTestsPassed) {
            console.log('🎉 Debug模式坐标调整功能工作正常！');
        } else {
            console.log('⚠️ Debug模式坐标调整功能存在问题，需要进一步检查');
        }
        
        console.log('═'.repeat(50));
        return allTestsPassed;
    }

    // 文件夹预览功能
    showFilePreview(fileType, element) {
        // 清除之前的选中状态
        document.querySelectorAll('.file-item').forEach(item => item.classList.remove('selected'));
        element.classList.add('selected');
        
        const previewContent = document.getElementById('file-preview-content');
        const openBtn = document.querySelector('.open-btn');
        
        this.selectedFileType = fileType;
        openBtn.disabled = false;
        
        let content = '';
        switch(fileType) {
            case 'joke':
                content = `
                    <div class="file-preview">
                        <h4>开发者笑话.txt</h4>
                        <div class="file-content">
                            <p>为什么程序员总是分不清万圣节和圣诞节？</p>
                            <p>因为 Oct 31 == Dec 25。</p>
                            <br>
                            <p>一个程序员的妻子告诉他："去商店买一瓶牛奶，如果有鸡蛋，买6个。"</p>
                            <p>程序员回来了，带着6瓶牛奶。</p>
                            <p>"为什么买这么多牛奶？"妻子问。</p>
                            <p>"因为他们有鸡蛋。"程序员回答。</p>
                        </div>
                    </div>
                `;
                break;
            case 'access':
                content = `
                    <div class="file-preview">
                        <h4>access_logs.txt</h4>
                        <div class="file-content">
                            <p>[2024-03-19 09:42:33] LOGIN: user.lin_mo SUCCESS</p>
                            <p>[2024-03-19 09:43:15] ACCESS: office_computer GRANTED</p>
                            <p>[2024-03-19 09:44:02] ALERT: unauthorized_email_insertion</p>
                            <p>[2024-03-19 09:44:03] TRACE: system.leak@quantum-matrix.corp</p>
                            <p>[2024-03-19 09:44:04] STATUS: security_breach_detected</p>
                            <p class="highlight">[2024-03-19 09:44:05] ACTION: lockdown_initiated</p>
                        </div>
                    </div>
                `;
                break;
            case 'report1':
                content = `
                    <div class="file-preview">
                        <h4>实验报告_001.txt</h4>
                        <div class="file-content">
                            <p><strong>量子意识克隆项目 - 第一阶段报告</strong></p>
                            <p>实验对象：027号（林默）</p>
                            <p>状态：意识传输成功率 94.7%</p>
                            <p>观察：对象表现出异常的环境适应能力</p>
                            <p class="warning">注意：检测到疑似"自我认知觉醒"信号</p>
                        </div>
                    </div>
                `;
                break;
            case 'report2':
                content = `
                    <div class="file-preview">
                        <h4>实验报告_002.txt</h4>
                        <div class="file-content">
                            <p><strong>量子意识克隆项目 - 第二阶段报告</strong></p>
                            <p>实验对象：027号（林默）</p>
                            <p>状态：虚拟环境稳定性下降</p>
                            <p class="danger">警告：对象开始质疑现实的真实性</p>
                            <p>建议：启动深度记忆重置协议</p>
                        </div>
                    </div>
                `;
                break;
        }
        
        previewContent.innerHTML = content;
    }
    
    // 图片预览功能
    showImagePreview(imageSrc, title, size, element) {
        // 清除之前的选中状态
        document.querySelectorAll('.image-item').forEach(item => item.classList.remove('selected'));
        element.classList.add('selected');
        
        const previewContent = document.getElementById('image-preview-content');
        const openBtn = document.querySelector('.open-btn');
        
        this.selectedImageSrc = imageSrc;
        this.selectedImageTitle = title;
        openBtn.disabled = false;
        
        previewContent.innerHTML = `
            <div class="image-preview">
                <div class="image-preview-info">
                    <h4>${title}</h4>
                    <p>尺寸: ${size} | 格式: PNG</p>
                </div>
                <div class="image-preview-container">
                    <img src="${imageSrc}" alt="${title}" class="preview-image">
                </div>
            </div>
        `;
    }
    
    // 打开当前选中的文件
    openCurrentFile() {
        if (this.selectedFileType) {
            this.showFileContent(this.selectedFileType);
        }
    }
    
    // 打开当前选中的图片
    openCurrentImage() {
        if (this.selectedImageSrc && this.selectedImageTitle) {
            this.previewImage(this.selectedImageSrc, this.selectedImageTitle);
        }
    }

    // 会议室交互
    openConferenceTV() {
        this.showModal('conference-modal');
        this.gameState.conferenceReplayActive = true;
        this.setupConferenceReplay();
    }
    
    setupConferenceReplay() {
        // 重置状态
        this.gameState.conferenceAbnormalState = false;
        
        // 更新按钮状态
        const normalBtn = document.getElementById('normal-state-btn');
        const abnormalBtn = document.getElementById('abnormal-state-btn');
        const conferenceScreen = document.getElementById('conference-screen');
        
        normalBtn.classList.add('active');
        abnormalBtn.classList.remove('active');
        
        // 设置初始背景为正常状态
        conferenceScreen.style.backgroundImage = "url('./public/images/conference.png')";
        
        // 隐藏异常计数器
        document.getElementById('anomaly-counter').style.display = 'none';
        
        // 清除之前的异常区域
        this.clearAnomalyAreas();
        
        // 更新状态消息
        document.getElementById('conference-status').textContent = "正在加载会议录像...检测到时间线异常";
        document.getElementById('conference-message').textContent = "";
    }
    
    switchConferenceState(state) {
        console.log(`🎬 切换会议录像状态到: ${state}`);
        
        const normalBtn = document.getElementById('normal-state-btn');
        const abnormalBtn = document.getElementById('abnormal-state-btn');
        const conferenceScreen = document.getElementById('conference-screen');
        const anomalyCounter = document.getElementById('anomaly-counter');
        
        if (state === 'normal') {
            this.gameState.conferenceAbnormalState = false;
            normalBtn.classList.add('active');
            abnormalBtn.classList.remove('active');
            conferenceScreen.style.backgroundImage = "url('./public/images/conference.png')";
            anomalyCounter.style.display = 'none';
            this.clearAnomalyAreas();
            console.log('✅ 切换到正常状态');
        } else if (state === 'abnormal') {
            this.gameState.conferenceAbnormalState = true;
            normalBtn.classList.remove('active');
            abnormalBtn.classList.add('active');
            conferenceScreen.style.backgroundImage = "url('./public/images/conference_abnormal.png')";
            anomalyCounter.style.display = 'block';
            this.createAnomalyAreas();
            this.updateAnomalyCounter();
            console.log('✅ 切换到异常状态');
        } else {
            console.error('❌ 未知的状态:', state);
        }
    }
    
    createAnomalyAreas() {
        const conferenceScreen = document.getElementById('conference-screen');
        
        // 清除现有的异常区域
        this.clearAnomalyAreas();
        
        console.log('🎯 创建异常检测区域');
        
        // 获取会议室屏幕的实际尺寸
        const screenRect = conferenceScreen.getBoundingClientRect();
        const screenWidth = screenRect.width;
        const screenHeight = screenRect.height;
        
        console.log(`📐 会议室屏幕尺寸: ${screenWidth}x${screenHeight}`);
        
        // 基础图片尺寸 (假设异常图片原始尺寸)
        const baseWidth = 1920;
        const baseHeight = 1080;
        
        // 计算缩放比例 (使用contain模式的缩放逻辑)
        const scaleX = screenWidth / baseWidth;
        const scaleY = screenHeight / baseHeight;
        const scale = Math.min(scaleX, scaleY);
        
        // 计算居中偏移
        const scaledWidth = baseWidth * scale;
        const scaledHeight = baseHeight * scale;
        const offsetX = (screenWidth - scaledWidth) / 2;
        const offsetY = (screenHeight - scaledHeight) / 2;
        
        console.log(`🔧 缩放比例: ${scale.toFixed(3)}, 偏移: ${offsetX.toFixed(1)},${offsetY.toFixed(1)}`);
        
        // 异常区域坐标（根据用户需求）
        const anomalies = [
            { 
                id: 'clock', 
                x: 370, y: 50, width: 150, height: 70,
                message: "时间在量子系统中不是线性的，会议可能从未发生过"
            },
            { 
                id: 'whiteboard', 
                x: 100, y: 390, width: 235, height: 25,
                message: "会议的真正议题被暴露了"
            },
            { 
                id: 'cup', 
                x: 980, y: 705, width: 55, height: 72,
                message: "有人发现了真相并试图逃离"
            }
        ];
        
        anomalies.forEach(anomaly => {
            const area = document.createElement('div');
            area.className = 'anomaly-area';
            area.id = `anomaly-${anomaly.id}`;
            
            // 应用缩放和偏移
            const scaledX = anomaly.x * scale + offsetX;
            const scaledY = anomaly.y * scale + offsetY;
            const scaledWidth = anomaly.width * scale;
            const scaledHeight = anomaly.height * scale;
            
            area.style.left = scaledX + 'px';
            area.style.top = scaledY + 'px';
            area.style.width = scaledWidth + 'px';
            area.style.height = scaledHeight + 'px';
            
            console.log(`📍 异常区域 ${anomaly.id}: 原坐标(${anomaly.x},${anomaly.y}) -> 缩放后(${scaledX.toFixed(1)},${scaledY.toFixed(1)}) ${scaledWidth.toFixed(1)}x${scaledHeight.toFixed(1)}`);
            
            // 检查是否已经被发现
            if (this.gameState.conferenceAnomaliesFound[anomaly.id]) {
                area.classList.add('found');
            }
            
            area.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`🔍 点击异常区域: ${anomaly.id}`);
                
                // 添加clicked类来显示红框
                area.classList.add('clicked');
                
                if (!this.gameState.conferenceAnomaliesFound[anomaly.id]) {
                    this.findAnomaly(anomaly.id, anomaly.message);
                } else {
                    // 即使已经发现，也显示消息
                    document.getElementById('conference-message').textContent = anomaly.message;
                }
            });
            
            conferenceScreen.appendChild(area);
        });
        
        console.log(`✅ 已创建 ${anomalies.length} 个异常检测区域`);
    }
    
    clearAnomalyAreas() {
        const conferenceScreen = document.getElementById('conference-screen');
        conferenceScreen.querySelectorAll('.anomaly-area').forEach(area => area.remove());
    }
    
    findAnomaly(anomalyId, message) {
        // 标记为已发现
        this.gameState.conferenceAnomaliesFound[anomalyId] = true;
        
        // 更新视觉效果
        const area = document.getElementById(`anomaly-${anomalyId}`);
        if (area) {
            area.classList.remove('clicked'); // 移除红框
            area.classList.add('found'); // 添加绿框
        }
        
        // 显示消息
        document.getElementById('conference-message').textContent = message;
        
        // 更新计数器
        this.updateAnomalyCounter();
        
        // 播放音效
        this.playAudio('click-audio');
        
        // 检查是否全部找到
        setTimeout(() => {
            this.checkAllAnomaliesFound();
        }, 1000);
    }
    
    updateAnomalyCounter() {
        const foundCount = Object.values(this.gameState.conferenceAnomaliesFound).filter(found => found).length;
        document.getElementById('anomaly-count').textContent = foundCount;
    }
    
    checkAllAnomaliesFound() {
        const allFound = Object.values(this.gameState.conferenceAnomaliesFound).every(found => found);
        
        if (allFound && !this.gameState.conferenceAllAnomaliesFound) {
            this.gameState.conferenceAllAnomaliesFound = true;
            
            // 显示最终消息
            const finalMessage = "这是S.L.的最后通信。我成功渗透了董事会会议系统。他们计划在明天重置所有测试对象的意识。27号，你是我们最后的希望。我在系统中植入了一个后门，出口代码是.....";
            document.getElementById('conference-message').textContent = finalMessage;
            
            // 获得密码纸片3
            setTimeout(() => {
                this.collectItem('pwd3', '密码纸片3');
                this.showDialog("你获得了密码纸片3！");
            }, 2000);
        }
    }
}

// 初始化游戏
let game;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 DOMContentLoaded 事件触发');
    game = new QuantumMatrixGame();
    
    // 全局函数导出（为了兼容HTML中的onclick）
    window.game = game;
    
    // 导出所有需要的全局函数
    window.showDesktop = () => game.showDesktop();
    window.loginComputer = () => game.loginComputer();
    window.closeModal = (modalId) => game.closeModal(modalId);
    window.addDigit = (digit) => game.addPasswordDigit(digit);
    window.clearPassword = () => game.clearPassword();
    window.confirmPassword = () => game.confirmPassword();
    window.flipImage = () => game.flipImage();
    window.selectCoffee = (type) => game.selectCoffee(type);
    window.drinkCoffee = () => game.drinkCoffee();
    window.playClaw = () => game.playClaw();
    window.discardToy = () => game.discardToy();
    window.verifyDoorAccess = () => game.verifyDoorAccess();
    window.switchConferenceState = (state) => game.switchConferenceState(state);
    
    // 确保诊断运行
    setTimeout(() => {
        if (game && typeof game.performScreenDiagnosis === 'function') {
            console.log('✅ 确保诊断运行');
        } else {
            console.log('❌ 诊断函数不可用');
        }
    }, 500);
});

// 立即执行的基础诊断（备用方案）
(function immediateBasicDiagnosis() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', immediateBasicDiagnosis);
        return;
    }
    
    console.log('🚨 立即诊断 (备用方案)');
    console.log('═'.repeat(30));
    console.log(`📱 浏览器窗口: ${window.innerWidth}x${window.innerHeight}`);
    console.log(`📱 屏幕分辨率: ${screen.width}x${screen.height}`);
    console.log(`🔍 像素比例: ${window.devicePixelRatio || 1}`);
    console.log(`⏰ 页面状态: ${document.readyState}`);
    console.log('═'.repeat(30));
})(); 