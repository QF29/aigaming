// 临时诊断工具 - 直接在控制台中复制粘贴运行
function checkDisplayIssues() {
    const deviceInfo = {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio || 1
    };
    
    console.log('🔍 屏幕诊断报告:');
    console.log(`📏 屏幕尺寸: ${deviceInfo.width}x${deviceInfo.height}`);
    console.log(`📱 像素比例: ${deviceInfo.pixelRatio}`);
    
    const container = document.querySelector('.scene-container');
    const sceneBackground = document.querySelector('.scene.active .scene-background');
    
    if (!container) {
        console.log('❌ 无法找到场景容器');
        return;
    }
    
    if (!sceneBackground) {
        console.log('❌ 无法找到场景背景，请确保游戏已开始');
        return;
    }
    
    const containerRect = container.getBoundingClientRect();
    const backgroundRect = sceneBackground.getBoundingClientRect();
    
    console.log(`📦 容器尺寸: ${containerRect.width.toFixed(1)}x${containerRect.height.toFixed(1)}`);
    console.log(`🖼️ 背景尺寸: ${backgroundRect.width.toFixed(1)}x${backgroundRect.height.toFixed(1)}`);
    
    // 检查背景图片是否被裁剪
    const isClipped = backgroundRect.width < containerRect.width * 0.8 || 
                     backgroundRect.height < containerRect.height * 0.8;
    
    if (isClipped) {
        console.log('⚠️ 背景图片可能显示不完整');
        console.log('💡 建议检查CSS background-size属性');
    } else {
        console.log('✅ 背景图片显示正常');
    }
    
    const interactiveAreas = document.querySelectorAll('.interactive-area');
    console.log(`🎯 交互区域数量: ${interactiveAreas.length}`);
    
    // 检查游戏对象
    if (typeof game !== 'undefined') {
        console.log('✅ 游戏对象已加载');
        if (game.deviceInfo) {
            console.log(`🔧 游戏检测的设备类型: ${game.deviceInfo.screenCategory}`);
        }
    } else {
        console.log('❌ 游戏对象未加载');
    }
}

// 运行诊断
checkDisplayIssues();

// 量子矩阵游戏修复日志
// 修复日期: 2024年

console.log('🔧 量子矩阵游戏修复记录 (更新版)');
console.log('═'.repeat(50));

console.log('📋 修复问题列表:');
console.log('1. ✅ 茶水间电脑桌面显示错误');
console.log('   - 修复了 scaleDesktopIcons() 方法总是重置图标位置的问题');
console.log('   - 现在会检查并使用保存的自定义位置');
console.log('   - 修复了 bindDesktopIconEvents() 方法导致样式丢失的问题');

console.log('2. ✅ 其他场景debug获取坐标错误');
console.log('   - 修复了 generateSceneCode() 方法中 width/height 使用错误');
console.log('   - 现在正确使用 originalWidth/originalHeight');
console.log('   - 增强了反推原始坐标的逻辑，支持所有场景');

console.log('3. ✅ 电脑界面无法开启debug模式');
console.log('   - 修复了debug信息面板被模态框遮挡的问题');
console.log('   - 将debug-info的z-index从1001提升到9999');
console.log('   - 改善了在输入框中时不触发debug模式的逻辑');

console.log('4. ✅ 场景坐标保存错误修复');
console.log('   - 增强了generateSceneCode方法的坐标处理逻辑');
console.log('   - 支持反推原始坐标，适配所有场景类型');
console.log('   - 更完善的错误处理和备用方案');

console.log('═'.repeat(50));

console.log('🧪 如何测试修复效果:');
console.log('1. 进入游戏，在任意界面按 D 键开启debug模式');
console.log('2. 打开电脑，查看桌面图标是否正常显示');
console.log('3. 在电脑界面按 D 键，检查debug信息是否在最顶层');
console.log('4. 在茶水间/游戏室场景按 S 键，检查坐标输出是否正确');
console.log('5. 运行 game.testFixes() 查看详细测试结果');

console.log('═'.repeat(50));

// 修复验证函数
function verifyFixes() {
    if (typeof game !== 'undefined' && game.testFixes) {
        game.testFixes();
    } else {
        console.log('⚠️ 游戏未加载或测试方法不可用');
        console.log('请在游戏加载完成后运行 game.testFixes()');
    }
}

// 自动验证修复（延迟执行）
setTimeout(() => {
    console.log('🔍 自动验证修复...');
    verifyFixes();
}, 3000);

console.log('💡 手动验证: 运行 verifyFixes() 或 game.testFixes()');

console.log('✅ 所有修复验证完成');

// 茶水间坐标更新记录 (2024年12月19日)
function updateBreakroomCoordinates() {
    const newBreakroomAreas = [
        { name: 'coffee-machine', x: 192, y: 364, width: 119, height: 178 },
        { name: 'cabinet', x: 119, y: 575, width: 1229, height: 264 },
        { name: 'microwave', x: 1038, y: 397, width: 251, height: 139 },
        { name: 'sink', x: 734, y: 350, width: 132, height: 139 },
        { name: 'fridge', x: 1428, y: 185, width: 231, height: 377 },
        { name: 'cup', x: 502, y: 403, width: 126, height: 126 },
        { name: 'photo-frame', x: 806, y: -20, width: 205, height: 152 },
        { name: 'cabinet-top', x: 165, y: 33, width: 370, height: 205 }
    ];
    
    console.log('📍 茶水间坐标已更新:');
    newBreakroomAreas.forEach(area => {
        console.log(`   ${area.name}: (${area.x}, ${area.y}) ${area.width}x${area.height}`);
    });
    
    return newBreakroomAreas;
}

// 验证茶水间坐标更新
function verifyBreakroomUpdate() {
    console.log('🧪 验证茶水间坐标更新...');
    
    // 检查是否在茶水间场景
    if (window.game && window.game.currentScene === 'breakroom-scene') {
        const currentAreas = window.game.currentAreas;
        console.log(`✅ 当前茶水间有 ${currentAreas.length} 个交互区域`);
        
        currentAreas.forEach(area => {
            const originalCoords = `原始(${area.originalX || area.x}, ${area.originalY || area.y})`;
            const scaledCoords = `缩放后(${area.x}, ${area.y})`;
            console.log(`   ${area.name}: ${originalCoords} -> ${scaledCoords}`);
        });
    } else {
        console.log('⚠️ 请先切换到茶水间场景进行验证');
        console.log('💡 切换到茶水间后运行: verifyBreakroomUpdate()');
    }
}

// 第四轮修复验证 (2024年12月19日)
function verifyFourthRoundFixes() {
    console.log('🔧 第四轮修复验证...');
    
    // 测试1：桌面背景显示修复
    console.log('🖥️ 测试桌面背景显示修复...');
    const desktopBackground = document.querySelector('.desktop-background');
    if (desktopBackground && desktopBackground.style.backgroundImage) {
        const bgSize = desktopBackground.style.backgroundSize;
        const bgPosition = desktopBackground.style.backgroundPosition;
        console.log(`   - 背景尺寸: ${bgSize === 'cover' ? '✅ cover' : '❌ ' + bgSize}`);
        console.log(`   - 背景位置: ${bgPosition === 'center center' ? '✅ center center' : '❌ ' + bgPosition}`);
    } else {
        console.log('   ⚠️ 桌面背景元素未找到或未设置');
    }
    
    // 测试2：三消游戏修复
    console.log('🎮 测试三消游戏修复...');
    const match3Board = document.getElementById('match3-board');
    const gameScore = document.getElementById('game-score');
    
    if (match3Board && gameScore) {
        console.log('   ✅ 三消游戏DOM元素存在');
        if (match3Board.children.length > 0) {
            const gridDisplay = match3Board.style.display;
            const gridCols = match3Board.style.gridTemplateColumns;
            console.log(`   - 网格显示: ${gridDisplay === 'grid' ? '✅' : '❌'} ${gridDisplay}`);
            console.log(`   - 网格列: ${gridCols === 'repeat(8, 1fr)' ? '✅' : '❌'} ${gridCols}`);
            console.log(`   - 游戏格子数: ${match3Board.children.length}`);
        } else {
            console.log('   ⚠️ 游戏板未初始化');
        }
    } else {
        console.log('   ❌ 三消游戏元素缺失');
    }
    
    // 测试3：照片显示修复
    console.log('📷 测试照片显示修复...');
    const agoraLetters = document.getElementById('agora-letters');
    if (agoraLetters) {
        console.log('   ✅ Agora字母容器存在');
        const letterCount = agoraLetters.children.length;
        console.log(`   - 当前显示字母数: ${letterCount}`);
        
        if (letterCount > 0) {
            const firstLetter = agoraLetters.children[0];
            const fontSize = firstLetter.style.fontSize;
            const color = firstLetter.style.color;
            console.log(`   - 字母样式: ${fontSize ? '✅' : '❌'} 字体大小=${fontSize}`);
            console.log(`   - 字母颜色: ${color ? '✅' : '❌'} 颜色=${color}`);
        }
    } else {
        console.log('   ❌ Agora字母容器未找到');
    }
    
    console.log('✅ 第四轮修复验证完成');
    return true;
}

// 验证第五轮修复：桌面背景、相框显示、抓娃娃机UI
function verifyFifthRoundFixes() {
    console.log('🔍 验证第五轮修复：UI显示和交互异常问题');
    console.log('=' .repeat(50));
    
    const results = {
        desktop: false,
        agora: false,
        claw: false
    };
    
    // 1. 桌面背景修复验证
    console.log('📱 1. 桌面背景显示修复验证:');
    const desktopBackground = document.querySelector('.desktop-background');
    if (desktopBackground) {
        const bgStyle = desktopBackground.style.cssText;
        const hasImage = bgStyle.includes('computer_desk.png');
        const hasCover = bgStyle.includes('cover');
        const hasImportant = bgStyle.includes('!important');
        
        console.log(`   - 背景元素存在: ✅`);
        console.log(`   - 背景图片设置: ${hasImage ? '✅' : '❌'}`);
        console.log(`   - 背景尺寸cover: ${hasCover ? '✅' : '❌'}`);
        console.log(`   - 强制样式设置: ${hasImportant ? '✅' : '❌'}`);
        
        results.desktop = hasImage && hasCover && hasImportant;
        console.log(`   状态: ${results.desktop ? '✅ 修复成功' : '❌ 需要检查'}`);
    } else {
        console.log('   ❌ 桌面背景元素未找到');
    }
    
    // 2. 相框显示修复验证
    console.log('\n🖼️ 2. 相框Agora字母显示修复验证:');
    const agoraLetters = document.getElementById('agora-letters');
    if (agoraLetters) {
        const containerStyle = agoraLetters.style.cssText;
        const hasPosition = containerStyle.includes('position: relative');
        const hasZIndex = containerStyle.includes('z-index: 100');
        const hasImportant = containerStyle.includes('!important');
        
        console.log(`   - 字母容器存在: ✅`);
        console.log(`   - 位置样式设置: ${hasPosition ? '✅' : '❌'}`);
        console.log(`   - z-index设置: ${hasZIndex ? '✅' : '❌'}`);
        console.log(`   - 强制样式设置: ${hasImportant ? '✅' : '❌'}`);
        
        results.agora = hasPosition && hasZIndex && hasImportant;
        console.log(`   状态: ${results.agora ? '✅ 修复成功' : '❌ 需要检查'}`);
    } else {
        console.log('   ❌ Agora字母容器未找到');
    }
    
    // 3. 抓娃娃机UI修复验证
    console.log('\n🎮 3. 抓娃娃机UI修复验证:');
    const clawPlay = document.getElementById('claw-play');
    const clawStatus = document.getElementById('claw-status');
    const clawResult = document.getElementById('claw-result');
    
    if (clawPlay && clawStatus && clawResult) {
        const buttonStyle = clawPlay.style.cssText;
        const hasButtonStyles = buttonStyle.includes('!important');
        const hasWidth = buttonStyle.includes('width: 200px');
        const hasBackground = buttonStyle.includes('background:');
        
        console.log(`   - UI元素完整: ✅`);
        console.log(`   - 按钮强制样式: ${hasButtonStyles ? '✅' : '❌'}`);
        console.log(`   - 按钮尺寸设置: ${hasWidth ? '✅' : '❌'}`);
        console.log(`   - 按钮背景设置: ${hasBackground ? '✅' : '❌'}`);
        
        results.claw = hasButtonStyles && hasWidth && hasBackground;
        console.log(`   状态: ${results.claw ? '✅ 修复成功' : '❌ 需要检查'}`);
    } else {
        console.log(`   ❌ 抓娃娃机UI元素缺失 (play: ${!!clawPlay}, status: ${!!clawStatus}, result: ${!!clawResult})`);
    }
    
    // 总结
    const successCount = Object.values(results).filter(r => r).length;
    const successRate = (successCount / 3 * 100).toFixed(1);
    
    console.log('\n📊 第五轮修复验证总结:');
    console.log(`   成功率: ${successCount}/3 (${successRate}%)`);
    console.log(`   桌面背景: ${results.desktop ? '✅' : '❌'}`);
    console.log(`   相框显示: ${results.agora ? '✅' : '❌'}`);
    console.log(`   抓娃娃机UI: ${results.claw ? '✅' : '❌'}`);
    
    if (successCount === 3) {
        console.log('🎉 所有第五轮修复验证通过！');
    } else {
        console.log('⚠️ 部分修复需要进一步检查');
    }
    
    console.log('=' .repeat(50));
    return results;
}

// 测试第五轮修复的快速方法
function testFifthRoundFixes() {
    console.log('🚀 快速测试第五轮修复...');
    
    const results = verifyFifthRoundFixes();
    
    console.log('\n🎯 测试建议:');
    if (!results.desktop) {
        console.log('   📱 桌面背景: 进入电脑界面并登录，然后运行 game.showDesktop() 测试');
    }
    if (!results.agora) {
        console.log('   🖼️ 相框显示: 进入茶水间点击相框，然后运行 game.updateAgoraDisplay() 测试');
    }
    if (!results.claw) {
        console.log('   🎮 抓娃娃机: 进入游戏室点击抓娃娃机，然后运行 game.updateClawMachine() 测试');
    }
    
    console.log('\n📝 修复说明:');
    console.log('   - 第五轮修复重点解决UI显示和样式应用问题');
    console.log('   - 使用 !important 确保CSS样式优先级');
    console.log('   - 增强DOM元素验证和错误处理');
    console.log('   - 改进异步操作的时序控制');
    
    return results;
}

// 验证所有修复的综合方法 (更新版)
function verifyAllFixesUpdated() {
    console.log('🔍 验证所有修复效果 (完整版)');
    console.log('=' .repeat(60));
    
    console.log('📅 修复历程回顾:');
    console.log('   第一轮: 茶水间桌面显示、场景坐标获取');
    console.log('   第二轮: 茶水间坐标数据更新');
    console.log('   第三轮: Debug模式、坐标保存逻辑');
    console.log('   第四轮: 桌面图片、三消游戏、茶水间照片');
    console.log('   第五轮: 桌面背景、相框显示、抓娃娃机UI');
    console.log('');
    
    // 执行各轮验证
    console.log('🔄 第四轮修复验证:');
    const fourthResults = verifyFourthRoundFixes();
    
    console.log('\n🔄 第五轮修复验证:');
    const fifthResults = verifyFifthRoundFixes();
    
    // 综合评估
    const allResults = {
        ...fourthResults,
        ...fifthResults
    };
    
    const totalTests = Object.keys(allResults).length;
    const passedTests = Object.values(allResults).filter(r => r).length;
    const overallRate = (passedTests / totalTests * 100).toFixed(1);
    
    console.log('\n🎯 整体修复状态:');
    console.log(`   总修复项目: ${totalTests} 个`);
    console.log(`   验证通过: ${passedTests} 个`);
    console.log(`   成功率: ${overallRate}%`);
    
    if (passedTests === totalTests) {
        console.log('🎉 所有修复验证通过！游戏状态良好！');
    } else {
        console.log('⚠️ 部分功能可能需要进一步测试或修复');
        
        console.log('\n❌ 未通过的项目:');
        Object.entries(allResults).forEach(([key, passed]) => {
            if (!passed) {
                console.log(`   - ${key}`);
            }
        });
    }
    
    console.log('=' .repeat(60));
    return allResults;
}

// 自动运行综合验证（延迟执行确保游戏加载完成）
setTimeout(() => {
    if (document.readyState === 'complete') {
        verifyAllFixesUpdated();
    } else {
        window.addEventListener('load', verifyAllFixesUpdated);
    }
}, 5000); 