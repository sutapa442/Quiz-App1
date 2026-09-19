/**
 * QuizMaster Pro - Preload Script
 * Exposes secure IPC bridges to the renderer process using contextBridge.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('quizAPI', {
  // Read state and questions
  getAppData: () => ipcRenderer.invoke('get-app-data'),
  saveAppData: (data) => ipcRenderer.invoke('save-app-data', data),
  getQuestions: () => ipcRenderer.invoke('get-questions')
});