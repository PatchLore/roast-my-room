const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')

// Check if Ollama is running
async function checkOllama() {
  try {
    const response = await fetch('http://localhost:11434/api/tags')
    return response.ok
  } catch (error) {
    return false
  }
}

// Create the main window
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  })

  // Load the Next.js app
  if (isDev) {
    // Development: load from localhost
    win.loadURL('http://localhost:3000')
  } else {
    // Production: load from built files
    win.loadFile(path.join(__dirname, 'out', 'index.html'))
  }

  // Open DevTools in development
  if (isDev) {
    win.webContents.openDevTools()
  }

  // Handle window close
  win.on('close', (e) => {
    const choice = dialog.showMessageBoxSync(win, {
      type: 'question',
      buttons: ['Exit', 'Cancel'],
      title: 'Confirm Exit',
      message: 'Are you sure you want to exit Roast My Room?'
    })
    
    if (choice === 1) {
      e.preventDefault()
    }
  })

  return win
}

// App lifecycle
app.whenReady().then(async () => {
  // Check if Ollama is running
  const ollamaRunning = await checkOllama()
  
  if (!ollamaRunning) {
    dialog.showMessageBox({
      type: 'warning',
      title: 'Ollama Not Detected',
      message: 'Ollama is not running. Please install Ollama from ollama.com to use this app.',
      buttons: ['OK']
    })
  }

  const mainWindow = createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})