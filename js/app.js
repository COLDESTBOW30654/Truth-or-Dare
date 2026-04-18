const { createApp, ref, computed, onMounted } = Vue;

createApp({
    setup() {
        const defaultTruthQuestions = ref([]);
        const defaultDareQuestions = ref([]);
        const truthQuestions = ref([]);
        const dareQuestions = ref([]);
        const customTruthQuestions = ref([]);
        const customDareQuestions = ref([]);
        
        const currentQuestion = ref(null);
        const customQuestion = ref('');
        const customType = ref('truth');
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
        
        async function loadQuestions() {
            try {
                isLoading.value = true;
                loadError.value = null;
                
                const [truthResponse, dareResponse] = await Promise.all([
                    fetch('./data/truth.json'),
                    fetch('./data/dare.json')
                ]);
                
                if (!truthResponse.ok) {
                    throw new Error('无法加载真心话题库');
                }
                if (!dareResponse.ok) {
                    throw new Error('无法加载大冒险题库');
                }
                
                const truthData = await truthResponse.json();
                const dareData = await dareResponse.json();
                
                defaultTruthQuestions.value = truthData.questions || [];
                defaultDareQuestions.value = dareData.questions || [];
                truthQuestions.value = [...defaultTruthQuestions.value];
                dareQuestions.value = [...defaultDareQuestions.value];
                
            } catch (error) {
                console.error('加载题库失败:', error);
                loadError.value = error.message;
                
                defaultTruthQuestions.value = [
                    "你最近一次撒谎是什么时候？关于什么的？",
                    "你有没有偷偷喜欢过朋友的对象？",
                    "你做过最尴尬的事情是什么？"
                ];
                defaultDareQuestions.value = [
                    "模仿一个动物叫三声！",
                    "给你最近联系的人发一条表白信息！",
                    "做20个深蹲！"
                ];
                truthQuestions.value = [...defaultTruthQuestions.value];
                dareQuestions.value = [...defaultDareQuestions.value];
            } finally {
                isLoading.value = false;
            }
        }
        
        function drawQuestion(type) {
            let question, questionType;
            
            if (type === 'truth') {
                if (truthQuestions.value.length === 0) return;
                const index = Math.floor(Math.random() * truthQuestions.value.length);
                question = truthQuestions.value[index];
                questionType = 'truth';
            } else if (type === 'dare') {
                if (dareQuestions.value.length === 0) return;
                const index = Math.floor(Math.random() * dareQuestions.value.length);
                question = dareQuestions.value[index];
                questionType = 'dare';
            } else {
                if (truthQuestions.value.length === 0 && dareQuestions.value.length === 0) return;
                
                if (truthQuestions.value.length === 0) {
                    const index = Math.floor(Math.random() * dareQuestions.value.length);
                    question = dareQuestions.value[index];
                    questionType = 'dare';
                } else if (dareQuestions.value.length === 0) {
                    const index = Math.floor(Math.random() * truthQuestions.value.length);
                    question = truthQuestions.value[index];
                    questionType = 'truth';
                } else {
                    if (Math.random() < 0.5) {
                        const index = Math.floor(Math.random() * truthQuestions.value.length);
                        question = truthQuestions.value[index];
                        questionType = 'truth';
                    } else {
                        const index = Math.floor(Math.random() * dareQuestions.value.length);
                        question = dareQuestions.value[index];
                        questionType = 'dare';
                    }
                }
            }
            
            currentQuestion.value = {
                text: question,
                type: questionType
            };
            
            addToHistory(questionType, question);
        }
        
        function addCustomQuestion() {
            if (!customQuestion.value.trim()) return;
            
            if (customType.value === 'truth') {
                truthQuestions.value.push(customQuestion.value.trim());
                customTruthQuestions.value.push(customQuestion.value.trim());
            } else {
                dareQuestions.value.push(customQuestion.value.trim());
                customDareQuestions.value.push(customQuestion.value.trim());
            }
            
            customQuestion.value = '';
        }
        
        function resetQuestions() {
            truthQuestions.value = [...defaultTruthQuestions.value];
            dareQuestions.value = [...defaultDareQuestions.value];
            customTruthQuestions.value = [];
            customDareQuestions.value = [];
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
        
        function loadSamplePlayers() {
            const samples = ['小明', '小红', '小华', '小丽', '小强', '小美'];
            samples.forEach(name => {
                if (!players.value.includes(name)) {
                    players.value.push(name);
                }
            });
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
            
            let question, questionType;
            if (Math.random() < 0.5) {
                const index = Math.floor(Math.random() * truthQuestions.value.length);
                question = truthQuestions.value[index];
                questionType = 'truth';
            } else {
                const index = Math.floor(Math.random() * dareQuestions.value.length);
                question = dareQuestions.value[index];
                questionType = 'dare';
            }
            
            combinedResult.value = {
                player,
                question,
                type: questionType
            };
            
            currentQuestion.value = {
                text: question,
                type: questionType
            };
            
            selectedPlayer.value = player;
            
            addToHistory(questionType, `${player} - ${question}`);
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
            
            let question, questionType;
            
            if (type === 'truth') {
                if (truthQuestions.value.length === 0) return;
                const index = Math.floor(Math.random() * truthQuestions.value.length);
                question = truthQuestions.value[index];
                questionType = 'truth';
            } else {
                if (dareQuestions.value.length === 0) return;
                const index = Math.floor(Math.random() * dareQuestions.value.length);
                question = dareQuestions.value[index];
                questionType = 'dare';
            }
            
            quickCurrentQuestion.value = {
                text: question,
                type: questionType
            };
            
            quickCombinedResult.value = {
                player: quickSelectedPlayer.value,
                question: question,
                type: questionType
            };
            
            addToHistory(questionType, `${quickSelectedPlayer.value} - ${question}`);
        }
        
        function quickRandomAll() {
            if (players.value.length === 0) {
                generateQuickPlayers();
            }
            
            quickDrawPlayer();
            
            setTimeout(() => {
                const randomType = Math.random() < 0.5 ? 'truth' : 'dare';
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
            loadSamplePlayers,
            randomAll,
            generateQuickPlayers,
            quickDrawPlayer,
            quickDrawQuestion,
            quickRandomAll,
            resetQuickMode,
            latestCommit,
            commitLoading
        };
    }
}).mount('#app');
