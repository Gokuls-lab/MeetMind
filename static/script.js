document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadSection = document.getElementById('upload-section');
    const processingSection = document.getElementById('processing-section');
    const resultsSection = document.getElementById('results-section');
    const statusText = document.getElementById('status-text');
    const analysisContent = document.getElementById('analysis-content');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const exportBtn = document.querySelector('.export-btn');

    let currentAnalysis = null;

    // Drag and Drop
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFile(fileInput.files[0]);
        }
    });

    async function handleFile(file) {
        // Switch UI to processing
        uploadSection.classList.add('hidden');
        processingSection.classList.remove('hidden');
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            statusText.innerText = "Uploading recording (this may take a moment)...";
            
            // Artificial delay for UX if upload is too fast (optional, but real upload takes time)
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Upload failed');
            }

            statusText.innerText = "Gemini is analyzing the meeting context...";
            
            const data = await response.json();
            currentAnalysis = data;
            
            showResults(data);

        } catch (error) {
            console.error(error);
            statusText.innerText = "Error: " + error.message;
            statusText.style.color = "#ef4444";
            setTimeout(() => {
                location.reload(); // Simple reset for now
            }, 3000);
        }
    }

    function showResults(data) {
        processingSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        
        // Render Summary by default
        renderTab('summary');
    }

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTab(btn.dataset.tab);
        });
    });

    function renderTab(tabName) {
        if (!currentAnalysis) return;

        let contentHtml = '';
        
        switch(tabName) {
            case 'summary':
                contentHtml = `
                    <div class="content-card">
                        <h3><i class="fa-solid fa-align-left"></i> Executive Summary</h3>
                        <p style="line-height: 1.6; color: #cbd5e1;">${currentAnalysis.summary.replace(/\n/g, '<br>')}</p>
                    </div>
                    <div class="content-card">
                        <h3><i class="fa-solid fa-list-check"></i> Agenda Covered</h3>
                        <ul style="padding-left: 20px; color: #cbd5e1;">
                            ${currentAnalysis.agenda_covered.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                `;
                break;
            
            case 'todos':
                if (currentAnalysis.action_items && currentAnalysis.action_items.length) {
                    contentHtml = currentAnalysis.action_items.map(item => {
                        let priorityClass = 'badge-medium';
                        if(item.priority && item.priority.toLowerCase() === 'high') priorityClass = 'badge-high';
                        if(item.priority && item.priority.toLowerCase() === 'low') priorityClass = 'badge-low';

                        return `
                        <div class="content-card" style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: white;">${item.task}</h4>
                                <div style="font-size: 0.9rem; color: var(--text-secondary);">
                                    <i class="fa-regular fa-user"></i> ${item.assignee || 'Unassigned'} &nbsp;|&nbsp; 
                                    <i class="fa-regular fa-calendar"></i> ${item.deadline || 'No deadline'}
                                </div>
                            </div>
                            <span class="badge ${priorityClass}">${item.priority || 'Medium'}</span>
                        </div>
                        `;
                    }).join('');
                } else {
                    contentHtml = `<div class="content-card"><p>No action items detected.</p></div>`;
                }
                break;
                
            case 'timeline':
                 contentHtml = `
                    <div class="content-card">
                        <h3><i class="fa-solid fa-clock-rotate-left"></i> Timeline of Key Events</h3>
                        <div style="margin-top: 1rem;">
                            ${currentAnalysis.timeline_events.map(event => `
                                <div style="display: flex; margin-bottom: 1rem; border-left: 2px solid var(--primary-color); padding-left: 1rem;">
                                    <div style="min-width: 60px; font-weight: bold; color: var(--accent-color);">${event.time}</div>
                                    <div style="color: #e2e8f0;">${event.event}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                break;
                
            case 'requirements':
                 contentHtml = `
                    <div class="content-card">
                        <h3><i class="fa-solid fa-clipboard-list"></i> Analyzed Requirements</h3>
                         <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; font-family: monospace; color: #a5f3fc; overflow-x: auto;">
                            <!-- Check if it is object or string -->
                            ${typeof currentAnalysis.analyzed_requirements === 'object' 
                                ? JSON.stringify(currentAnalysis.analyzed_requirements, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;') 
                                : currentAnalysis.analyzed_requirements.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                `;
                break;
                
            case 'sentiment':
                contentHtml = `
                    <div class="content-card">
                        <h3><i class="fa-solid fa-heart-pulse"></i> Sentiment Analysis</h3>
                        <p style="font-size: 1.2rem;">${currentAnalysis.sentiment_analysis}</p>
                    </div>
                     <div class="content-card">
                        <h3><i class="fa-solid fa-lightbulb"></i> Follow-up Suggestions</h3>
                        <ul style="padding-left: 20px; color: #cbd5e1;">
                            ${currentAnalysis.follow_up_suggestions.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                `;
                break;
        }

        analysisContent.innerHTML = contentHtml;
    }

    // Export Logic
    exportBtn.addEventListener('click', () => {
        if (!currentAnalysis) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentAnalysis, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "meeting_analysis.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });
});
