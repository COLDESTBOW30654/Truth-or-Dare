const { createApp, ref, computed, onMounted, watch } = Vue;

createApp({
    setup() {
        const defaultTruthQuestions = ref([]);
        const defaultDareQuestions = ref([]);
        const truthQuestionsRaw = ref([]);
        const dareQuestionsRaw = ref([]);
        const truthQuestions = ref([]);
        const dareQuestions = ref([]);
        const customTruthQuestions = ref([]);
        const customDareQuestions = ref([]);
        
        const typesConfig = ref(null);
        const allTypes = ref([]);
        const selectedTypes = ref([]);
        
        const currentQuestion = ref(null);
        const customQuestion = ref('');
        const customType = ref('truth');
        const customQuestionTypes = ref(['朋友', '聚会']);
        const showCustomPanel = ref(false);
        
        const players = ref([]);
        const newPlayer = ref('');
        const batchPlayers = ref('');
        const showBatchAdd = ref(false);
        const selectedPlayer = ref(null);
        const showConfirmModal = ref(false);
        
        const history = ref([]);
        const combinedResult = ref(null);
        
        const showCopyToast = ref(false);
        const isLoading = ref(true);
        const loadError = ref(null);
        
        const playerCount = ref(4);
        const quickPlayerName = ref('');
        const quickSelectedPlayer = ref(null);
        const quickCurrentQuestion = ref(null);
        const quickCombinedResult = ref(null);
        
        const latestCommit = ref(null);
        const commitLoading = ref(true);
        
        const truthCount = computed(() => truthQuestions.value.length);
        const dareCount = computed(() => dareQuestions.value.length);
        const playerTotal = computed(() => players.value.length);
        const isAllSelected = computed(() => selectedTypes.value.length === allTypes.value.length);
        
        function filterQuestionsByTypes(questions, types) {
            if (types.length === 0) return [];
            return questions.filter(q => {
                if (typeof q === 'string') return true;
                if (!q.types || q.types.length === 0) return true;
                return q.types.some(t => types.includes(t));
            });
        }
        
        function getQuestionText(q) {
            return typeof q === 'string' ? q : q.text;
        }
        
        async function loadQuestions() {
            try {
                isLoading.value = true;
                loadError.value = null;
                
                const configResponse = await fetch('./data/types-config.json');
                if (!configResponse.ok) {
                    throw new Error('无法加载类型配置');
                }
                
                const config = await configResponse.json();
                typesConfig.value = config;
                
                allTypes.value = Object.keys(config.types);
                selectedTypes.value = Object.entries(config.types)
                    .filter(([_, typeConfig]) => typeConfig.defaultSelected)
                    .map(([name, _]) => name);
                
                const truthFiles = [];
                const dareFiles = [];
                
                for (const [typeName, typeConfig] of Object.entries(config.types)) {
                    if (typeConfig.files.truth) {
                        truthFiles.push({ type: typeName, file: typeConfig.files.truth });
                    }
                    if (typeConfig.files.dare) {
                        dareFiles.push({ type: typeName, file: typeConfig.files.dare });
                    }
                }
                
                const truthPromises = truthFiles.map(async ({ type, file }) => {
                    try {
                        const response = await fetch('./' + file);
                        if (!response.ok) return [];
                        const data = await response.json();
                        const questions = (data.questions || []).map(q => ({
                            ...q,
                            types: q.types || [type]
                        }));
                        return questions;
                    } catch (e) {
                        console.warn(`加载 ${file} 失败:`, e);
                        return [];
                    }
                });
                
                const darePromises = dareFiles.map(async ({ type, file }) => {
                    try {
                        const response = await fetch('./' + file);
                        if (!response.ok) return [];
                        const data = await response.json();
                        const questions = (data.questions || []).map(q => ({
                            ...q,
                            types: q.types || [type]
                        }));
                        return questions;
                    } catch (e) {
                        console.warn(`加载 ${file} 失败:`, e);
                        return [];
                    }
                });
                
                const [truthResults, dareResults] = await Promise.all([
                    Promise.all(truthPromises),
                    Promise.all(darePromises)
                ]);
                
                defaultTruthQuestions.value = truthResults.flat();
                defaultDareQuestions.value = dareResults.flat();
                truthQuestionsRaw.value = [...defaultTruthQuestions.value];
                dareQuestionsRaw.value = [...defaultDareQuestions.value];
                
                updateFilteredQuestions();
                
            } catch (error) {
                console.error('加载题库失败:', error);
                loadError.value = error.message;
                
                defaultTruthQuestions.value = [
                    {text: "你最近一次撒谎是什么时候？关于什么的？", types: ["朋友", "聚会"]},
                    {text: "你有没有偷偷喜欢过朋友的对象？", types: ["朋友", "聚会"]},
                    {text: "你做过最尴尬的事情是什么？", types: ["朋友", "聚会", "恋人", "情侣"]}
                ];
                defaultDareQuestions.value = [
                    {text: "模仿一个动物叫三声！", types: ["朋友", "聚会"]},
                    {text: "给你最近联系的人发一条表白信息！", types: ["朋友", "聚会", "恋人", "情侣"]},
                    {text: "做20个深蹲！", types: ["朋友", "聚会", "恋人", "情侣"]}
                ];
                truthQuestionsRaw.value = [...defaultTruthQuestions.value];
                dareQuestionsRaw.value = [...defaultDareQuestions.value];
                
                allTypes.value = ['朋友', '聚会', '恋人', '情侣', '社牛', '丢脸', '玩笑', '成人'];
                selectedTypes.value = ['朋友', '聚会', '玩笑'];
                
                updateFilteredQuestions();
            } finally {
                isLoading.value = false;
            }
        }
        
        function updateFilteredQuestions() {
            const allQuestions = [...truthQuestionsRaw.value, ...customTruthQuestions.value];
            truthQuestions.value = filterQuestionsByTypes(allQuestions, selectedTypes.value);
            
            const allDareQuestions = [...dareQuestionsRaw.value, ...customDareQuestions.value];
            dareQuestions.value = filterQuestionsByTypes(allDareQuestions, selectedTypes.value);
        }
        
        function toggleType(type) {
            const index = selectedTypes.value.indexOf(type);
            if (index > -1) {
                selectedTypes.value.splice(index, 1);
            } else {
                selectedTypes.value.push(type);
            }
            updateFilteredQuestions();
        }
        
        function selectAllTypes() {
            selectedTypes.value = [...allTypes.value];
            updateFilteredQuestions();
        }
        
        function clearAllTypes() {
            selectedTypes.value = [];
            updateFilteredQuestions();
        }
        
        function drawQuestion(type) {
            if (truthQuestions.value.length === 0 && dareQuestions.value.length === 0) {
                alert('当前筛选条件下没有可用题目，请选择更多类型！');
                return;
            }
            
            let questionObj, questionType;
            
            if (type === 'truth') {
                if (truthQuestions.value.length === 0) {
                    alert('当前筛选条件下没有真心话题目，请选择更多类型！');
                    return;
                }
                const index = Math.floor(Math.random() * truthQuestions.value.length);
                questionObj = truthQuestions.value[index];
                questionType = 'truth';
            } else if (type === 'dare') {
                if (dareQuestions.value.length === 0) {
                    alert('当前筛选条件下没有大冒险题目，请选择更多类型！');
                    return;
                }
                const index = Math.floor(Math.random() * dareQuestions.value.length);
                questionObj = dareQuestions.value[index];
                questionType = 'dare';
            } else {
                if (truthQuestions.value.length === 0) {
                    const index = Math.floor(Math.random() * dareQuestions.value.length);
                    questionObj = dareQuestions.value[index];
                    questionType = 'dare';
                } else if (dareQuestions.value.length === 0) {
                    const index = Math.floor(Math.random() * truthQuestions.value.length);
                    questionObj = truthQuestions.value[index];
                    questionType = 'truth';
                } else {
                    if (Math.random() < 0.5) {
                        const index = Math.floor(Math.random() * truthQuestions.value.length);
                        questionObj = truthQuestions.value[index];
                        questionType = 'truth';
                    } else {
                        const index = Math.floor(Math.random() * dareQuestions.value.length);
                        questionObj = dareQuestions.value[index];
                        questionType = 'dare';
                    }
                }
            }
            
            const questionText = getQuestionText(questionObj);
            currentQuestion.value = {
                text: questionText,
                type: questionType,
                types: typeof questionObj === 'object' ? (questionObj.types || []) : []
            };
            
            addToHistory(questionType, questionText);
        }
        
        function addCustomQuestion() {
            if (!customQuestion.value.trim()) return;
            
            const newQuestion = {
                text: customQuestion.value.trim(),
                types: [...customQuestionTypes.value]
            };
            
            if (customType.value === 'truth') {
                customTruthQuestions.value.push(newQuestion);
            } else {
                customDareQuestions.value.push(newQuestion);
            }
            
            updateFilteredQuestions();
            customQuestion.value = '';
        }
        
        function resetQuestions() {
            truthQuestionsRaw.value = [...defaultTruthQuestions.value];
            dareQuestionsRaw.value = [...defaultDareQuestions.value];
            customTruthQuestions.value = [];
            customDareQuestions.value = [];
            updateFilteredQuestions();
        }
        
        function copyQuestion() {
            if (!currentQuestion.value) return;
            
            const text = `【${currentQuestion.value.type === 'truth' ? '真心话' : '大冒险'}】${currentQuestion.value.text}`;
            navigator.clipboard.writeText(text).then(() => {
                showCopyToast.value = true;
                setTimeout(() => {
                    showCopyToast.value = false;
                }, 2000);
            });
        }
        
        function copyQuickResult() {
            if (!quickCombinedResult.value) return;
            
            const text = `【${quickCombinedResult.value.player}】请完成：【${quickCombinedResult.value.type === 'truth' ? '真心话' : '大冒险'}】${quickCombinedResult.value.question}`;
            navigator.clipboard.writeText(text).then(() => {
                showCopyToast.value = true;
                setTimeout(() => {
                    showCopyToast.value = false;
                }, 2000);
            });
        }
        
        function addPlayer() {
            const name = newPlayer.value.trim();
            if (!name) return;
            if (players.value.includes(name)) {
                newPlayer.value = '';
                return;
            }
            
            players.value.push(name);
            newPlayer.value = '';
        }
        
        function batchAddPlayers() {
            const names = batchPlayers.value
                .split('\n')
                .map(n => n.trim())
                .filter(n => n && !players.value.includes(n));
            
            players.value.push(...names);
            batchPlayers.value = '';
            showBatchAdd.value = false;
        }
        
        function removePlayer(index) {
            players.value.splice(index, 1);
        }
        
        function drawPlayer() {
            if (players.value.length === 0) {
                alert('请先添加玩家！');
                return;
            }
            
            const index = Math.floor(Math.random() * players.value.length);
            selectedPlayer.value = players.value[index];
            
            addToHistory('player', selectedPlayer.value);
        }
        
        function confirmClearPlayers() {
            showConfirmModal.value = true;
        }
        
        function clearAllPlayers() {
            players.value = [];
            selectedPlayer.value = null;
            showConfirmModal.value = false;
        }
        
        function addToHistory(type, text) {
            const now = new Date();
            const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            history.value.unshift({ type, text, time });
            
            if (history.value.length > 3) {
                history.value.pop();
            }
        }
        
        function randomAll() {
            if (players.value.length === 0) {
                alert('请先添加玩家！');
                return;
            }
            
            const playerIndex = Math.floor(Math.random() * players.value.length);
            const player = players.value[playerIndex];
            
            let questionObj, questionType;
            if (Math.random() < 0.5) {
                const index = Math.floor(Math.random() * truthQuestions.value.length);
                questionObj = truthQuestions.value[index];
                questionType = 'truth';
            } else {
                const index = Math.floor(Math.random() * dareQuestions.value.length);
                questionObj = dareQuestions.value[index];
                questionType = 'dare';
            }
            
            const questionText = getQuestionText(questionObj);
            const questionTypes = typeof questionObj === 'object' ? (questionObj.types || []) : [];
            
            combinedResult.value = {
                player,
                question: questionText,
                type: questionType,
                types: questionTypes
            };
            
            currentQuestion.value = {
                text: questionText,
                type: questionType,
                types: questionTypes
            };
            
            selectedPlayer.value = player;
            
            addToHistory(questionType, `${player} - ${questionText}`);
        }
        
        function generateQuickPlayers() {
            players.value = [];
            for (let i = 1; i <= playerCount.value; i++) {
                players.value.push(`玩家${i}`);
            }
        }
        
        function quickDrawPlayer() {
            if (players.value.length === 0) {
                generateQuickPlayers();
            }
            
            const index = Math.floor(Math.random() * players.value.length);
            quickSelectedPlayer.value = players.value[index];
            quickCurrentQuestion.value = null;
            quickCombinedResult.value = null;
        }
        
        function quickDrawQuestion(type) {
            if (!quickSelectedPlayer.value) {
                alert('请先抽取玩家！');
                return;
            }
            
            if (truthQuestions.value.length === 0 && dareQuestions.value.length === 0) {
                alert('当前筛选条件下没有可用题目，请选择更多类型！');
                return;
            }
            
            let questionObj, questionType;
            
            if (type === 'truth') {
                if (truthQuestions.value.length === 0) {
                    alert('当前筛选条件下没有真心话题目，请选择更多类型！');
                    return;
                }
                const index = Math.floor(Math.random() * truthQuestions.value.length);
                questionObj = truthQuestions.value[index];
                questionType = 'truth';
            } else {
                if (dareQuestions.value.length === 0) {
                    alert('当前筛选条件下没有大冒险题目，请选择更多类型！');
                    return;
                }
                const index = Math.floor(Math.random() * dareQuestions.value.length);
                questionObj = dareQuestions.value[index];
                questionType = 'dare';
            }
            
            const questionText = getQuestionText(questionObj);
            const questionTypes = typeof questionObj === 'object' ? (questionObj.types || []) : [];
            
            quickCurrentQuestion.value = {
                text: questionText,
                type: questionType,
                types: questionTypes
            };
            
            quickCombinedResult.value = {
                player: quickSelectedPlayer.value,
                question: questionText,
                type: questionType,
                types: questionTypes
            };
            
            addToHistory(questionType, `${quickSelectedPlayer.value} - ${questionText}`);
        }
        
        function quickRandomAll() {
            if (players.value.length === 0) {
                generateQuickPlayers();
            }
            
            if (truthQuestions.value.length === 0 && dareQuestions.value.length === 0) {
                alert('当前筛选条件下没有可用题目，请选择更多类型！');
                return;
            }
            
            quickDrawPlayer();
            
            setTimeout(() => {
                let randomType;
                if (truthQuestions.value.length === 0) {
                    randomType = 'dare';
                } else if (dareQuestions.value.length === 0) {
                    randomType = 'truth';
                } else {
                    randomType = Math.random() < 0.5 ? 'truth' : 'dare';
                }
                quickDrawQuestion(randomType);
            }, 300);
        }
        
        function resetQuickMode() {
            quickSelectedPlayer.value = null;
            quickCurrentQuestion.value = null;
            quickCombinedResult.value = null;
        }
        
        async function fetchLatestCommit() {
            try {
                commitLoading.value = true;
                const response = await fetch('https://api.github.com/repos/COLDESTBOW30654/Truth-or-Dare/commits?per_page=1');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch commit');
                }
                
                const data = await response.json();
                
                if (data && data.length > 0) {
                    const commit = data[0];
                    const commitDate = new Date(commit.commit.author.date);
                    
                    latestCommit.value = {
                        message: commit.commit.message,
                        author: commit.commit.author.name,
                        date: formatDate(commitDate),
                        sha: commit.sha.substring(0, 7),
                        url: commit.html_url
                    };
                }
            } catch (error) {
                console.error('Failed to fetch latest commit:', error);
                latestCommit.value = null;
            } finally {
                commitLoading.value = false;
            }
        }
        
        function formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            return `${year}年${month}月${day}日 ${hours}:${minutes}`;
        }
        
        onMounted(() => {
            loadQuestions();
            fetchLatestCommit();
        });
        
        return {
            truthQuestions,
            dareQuestions,
            currentQuestion,
            customQuestion,
            customType,
            customQuestionTypes,
            showCustomPanel,
            players,
            newPlayer,
            batchPlayers,
            showBatchAdd,
            selectedPlayer,
            showConfirmModal,
            history,
            combinedResult,
            showCopyToast,
            isLoading,
            loadError,
            truthCount,
            dareCount,
            playerTotal,
            playerCount,
            quickPlayerName,
            quickSelectedPlayer,
            quickCurrentQuestion,
            quickCombinedResult,
            allTypes,
            selectedTypes,
            loadQuestions,
            drawQuestion,
            addCustomQuestion,
            resetQuestions,
            copyQuestion,
            copyQuickResult,
            addPlayer,
            batchAddPlayers,
            removePlayer,
            drawPlayer,
            confirmClearPlayers,
            clearAllPlayers,
            randomAll,
            generateQuickPlayers,
            quickDrawPlayer,
            quickDrawQuestion,
            quickRandomAll,
            resetQuickMode,
            latestCommit,
            commitLoading,
            toggleType,
            selectAllTypes,
            clearAllTypes,
            isAllSelected
        };
    }
}).mount('#app');
