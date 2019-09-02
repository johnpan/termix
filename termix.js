(function (window, termix) {
    if (termix) {
        console.log ('termix already loaded');
        return; 
    }
/**
 * termix - Terminal Experience
 * This is a UI-command-line utility to help typing the less keystrokes possible.
 * It can be useful when a single command has to be used a lot of times.
 * With this util the command can remember its parameters from previous invoke until they get changed
 * To check what would be parsed, add '-help' or 'help' according to the syntax you use at the eol
 * or change command's setting (ask)verification to 1 using /options special command
 */

const termix_version = "0.3.1"; 
let    
    cmdElem = {},
    importedElementsIDs = [], 
    importedCommandsNames = [],
    previousCommand = '',
    _history = [],
    historyPointer = -1,
    unverifiedParseData = {},
    dialogData = [],
    dialogPromiser = {isBusy: false, forceBreak:false},
    logLevel = 1,
    allowEval = 0,
    useLastCommand = 0,
    domElements = [],
    commands = [
        {
            command: 'insert',
            commandKey: 'i',
            help: `sample on how default params work`, 
            method: (dataObj) => {
                // custom code to run command operation
                return `inserted: ${JSON.stringify(dataObj, cautiousStringifier)}`;                     
            },
            defaults: {
                who: 'joe',
                verb: 'is',
                what: 'awsome',
                when: new Date().toJSON().slice(0,10)
            },               
            mergePolicy: 2,
            askVerification: 1
        },
        {
            command: 'maps',
            commandKey: 'maps',
            ignoreParse: 1,
            method: (dataLine) => {
                let transactionWindow = window.open(
                    `https://www.google.com/maps/search/${dataLine}`, 
                    'termixWindow'+rnd()
                );
            }
        },
        {
            command: 'google',
            commandKey: 'g',
            ignoreParse: 1,
            method: (dataLine) => {
                let transactionWindow = window.open(
                    `https://www.google.com/search?q=${dataLine}`, 
                    'termixWindow'+rnd()
                );
            }
        },
        {
            command: 'beep',
            help: `default parameters: frequency=1500, type=elegant, volume=1, duration=350, msg=beep
                        available types: sine, square, sawtooth, triangle, elegant`,
            method: (dataObj) => {
                var {frequency=1500, type='elegant', volume=1, duration=350, msg='beep'} = dataObj;
                const 
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)(),
                    oscillator = audioCtx.createOscillator(),
                    gainNode = audioCtx.createGain(),
                    types = ['sine', 'square', 'sawtooth', 'triangle']
                ;
                if (msg) log(1, msg);
                keepInRange = (val, min, max) => {
                    val = val < min ? min : val;
                    val = val > max ? max : val;
                    return val;	
                };            
                // validate
                frequency = keepInRange(frequency, 40, 6000);
                volume = keepInRange(volume, 0, 1);
                duration = keepInRange(duration, 100, 5000);
                type = type.toLowerCase();
                type = types.includes(type) ? type : 'elegant';            
                if (type=='elegant') {
                    const snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
                    snd.volume = volume;
                    snd.play();
                    return;
                }
                // go play
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                gainNode.gain.value = volume;
                oscillator.frequency.value = frequency;
                oscillator.type = type;
                oscillator.start();                
                setTimeout( () => { oscillator.stop(); }, duration );
            }
        },
        {
            command: 'morse',
            commandKey: 'mors',
            help: `syntax sample: mors ..-. -.. .-- --. ..--.`,
            ignoreParse: 1,
            method: (dataLine) => {
                const                 
                    signal = dataLine,
                    durations = { "." : 250, "-" : 450, "_" : 450, " " : 200 }, 
                    beepSettings = { frequency:1500, type:'square', volume:1, msg:''}
                ;
                playChar = (signal) => {
                    const _sound = signal[0], d = durations[_sound];
                    if (_sound == " ") {
                        setTimeout( () => { playChar(signal.substr(1)) }, d );
                    } else if (d) {
                        beepSettings.duration = d;
                        apply('beep', beepSettings);                       
                        setTimeout( () => { playChar(signal.substr(1)) }, d );
                    } else if (_sound) {
                        playChar(signal.substr(1));
                    }
                };
                playChar (signal);
            }
        },
        {
            command: 'speak',
            help: `syntax sample: speak -msg This is a test -volume 0.6 -voice 4`,
            method: (dataObj) => {
                const
                    _msg = new SpeechSynthesisUtterance(dataObj.message || dataObj.msg || Object.getOwnPropertyNames(dataObj)[0] || 'hello'), 
                    voices = window.speechSynthesis.getVoices();
                ;
                _msg.voice = voices[(dataObj.voice || 4)];
                _msg.volume = dataObj.volume || 1;
                window.speechSynthesis.speak(_msg);
            }
        }

    ],
    specialCommands = [
        {
            command: '/options',
            commandKey: '/opts',
            help: `syntax: /opts(/options) -merge-policy [number] -log-level [number] -auto-enter [0|1] -verification [0|1]
            -show: shows all options for last used command
            -merge-policy [0-3]: changes the mergePolicy for last used command. 
                0: default, merge all, (defaults are not required input)
                1: ignore defaults, merge lastData (defaults act as required input)
                2: merge defaults, ignore lastData (defaults are not overwriten by input)
                3: ignore all (defaults act as required input)
            -log-level [0-3]: changes the log detail level
                0: log errors only
                1: default. Log method's output & errors
                2: log level 1 & command line per enter hit
                3: log level 2 & parsed data per enter hit
            -use-last-command [0|1]: if no command typed, use last command with the incoming params
            -verification [0|1]: changes the verification policy for last used command. Termix will show dataObj to be executed and ask a verification enter
            -allow-eval [0|1]: allow special command /eval to run javascript
            -ignore-parse [0|1]: send unparsed command line data
            `,
            settingsMapper : [
                {
                    param: 'merge-policy',
                    action: (paramValue) => {       
                        const commandObj = findCommandObj(previousCommand, commands);
                        commandObj.mergePolicy = Number(paramValue);
                        log(1, `merge-policy changed for command: ${previousCommand}`);
                    }
                },
                {
                    param: 'ignore-parse',
                    action: (paramValue) => {       
                        const commandObj = findCommandObj(previousCommand, commands);
                        commandObj.ignoreParse = Number(paramValue);
                        log(1, `ignore-parse changed for command: ${previousCommand}`);
                    }
                },
                {
                    param: 'log-level',
                    action: (paramValue) => {
                        logLevel = Number(paramValue);
                        log(1, 'log-level changed to '+paramValue);
                    }
                },
                {
                    param: 'use-last-command',
                    action: (paramValue) => {
                        useLastCommand = Number(paramValue);
                        log(1, 'use-last-command changed to '+paramValue);
                    }
                },
                {
                    param: 'verification',
                    action: (paramValue) => {       
                        const commandObj = findCommandObj(previousCommand, commands);
                        commandObj.askVerification = Number(paramValue);
                        log(1, `verification option changed for command: ${previousCommand}`);
                    }
                },
                {
                    param: 'allow-eval',
                    action: (paramValue) => {
                        allowEval = Number(paramValue);
                        log(1, 'allow-eval changed to '+paramValue);
                    }
                },
                {
                    param: 'show',
                    action: (paramValue) => {       
                        const commandObj = findCommandObj(previousCommand, commands);
                        log(0, `
                        Command: '${previousCommand}' settings: 
                         merge-policy: ${commandObj.mergePolicy}
                         verification: ${commandObj.askVerification}   
                         ignore-parse: ${commandObj.ignoreParse}                       
                        Global settings:
                         allow-eval: ${allowEval}
                         log-level: ${logLevel}
                         use-last-command: ${useLastCommand}`);
                    }
                },
            ]                   
        },
        {
            command: '/clear',
            commandKey: '/c',
            help: `syntax: /c(/clear) -log -history -command -data
            -log: Clears the log textarea/ You can also use /cls
            -history: clears command history
            -command: clears previous command 
            -data: clears cached params for the previous command
            -all: clears all above
            `,
            settingsMapper : [
                {
                    param: 'history',
                    action: () => {
                        _history = [];
                        historyPointer = -1;
                        log(1, "history is empty");
                    }
                },
                {
                    param: 'data',
                    action: () => {
                        const commandObj = findCommandObj(previousCommand, commands);
                        commandObj.lastData = {};
                        log(1, `cached params cleared for command: ${previousCommand}`);
                    }
                },
                {
                    param: 'log',
                    action: (clearMsg) => {
                        setOutput(clearMsg || "Termix v"+termix_version, false);
                    }
                },
                {
                    param: 'command',
                    action: () => {
                        log(1, `Previous command forgotten: ${previousCommand}`);
                        previousCommand = '';
                    }
                },
                {
                    param: 'all',
                    action: () => {
                        handleEnter("/clear -history -data -command -log");
                        log(1, `All gone`);
                    }
                },

            ]
        },
        {
            command: '/clone',
            commandKey: '/cp',
            help: `clones a command and gives it a new name`,
            method: (dataObj) => {
                // this way the user will have a second lastData obj to use
            }
        },
        {
            command: '/import-command',
            help: `imports custom command`,
            method: (dataObj) => {
                // todo: eval method or wrap with window...
                // sample should work: /import-command -command myFirstCom -commandKey mfc -verification 1 -merge-policy 2 -method termix.log
    
                return importCommand(dataObj);
            }
        },
        {
            command: '/import-element',
            help: `imports dom element`,
            method: (dataObj) => {
                // todo: eval method or wrap with window...
                // sample should work: /import-element -selectCommand document.querySelectorAll(".ReactVirtualized__Table")[0] -elemName termixPlaceholder
                       
                return ensureElement(dataObj);
            }
        },
        {
            command: '/history',
            help: `logs the history`,
            method: () => {
                log(0, _history);
            }
        },
        {
            command: '/eval', 
            commandKey: '/e',       
            help: `runs pure js`
        },
        {
            command: '/get',
            help: `sends a GET request`,
            method: () => {
                // todo ajax get
            }
        },
        {
            command: '/post',
            help: `sends a POST request`,
            method: () => {
                // todo ajax post
            }
        },
        {
            command: '/watch-net',
            commandKey: '/w',
            help: `logs all xhr requests`,
            method: () => {
                // todo requests watcher
            }
        },
        {
            command: '/watchdog',
            commandKey: '/wd',
            help: `runs a method per second`,
            method: () => {
                // todo watcher per second run method
            }
        },
        {
            command: '/storage',
            commandKey: '/store',
            help: `gets, sets, and removes from LocalStorage or/and SessionStorage`,
            method: () => {
                // todo local storage get, set, remove
            }
        },
        {
            command: '/hide',
            help: `hides Termix. To show again, type 'termix.show()' in console`,
            method: () => {
                cmdElem.style.display = 'none';
                console.info('type termix.show() to bring Termix back');
            }
        },
        {
            command: '/load',
            commandKey: '/l',
            ignoreParse: 1,
            help: `loads js script. Use its URL or short name (jquery, moment)`,
            method: (dataLine) => {               
                predefined = {
                    "jquery":"//code.jquery.com/jquery.min.js",
                    "moment":"//cdn.jsdelivr.net/momentjs/latest/moment.min.js",
                    "d3":"//cdnjs.cloudflare.com/ajax/libs/d3/5.9.2/d3.min.js",
                    "datatables":"//cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js",
                    "pusher":"//js.pusher.com/4.4/pusher.min.js"
                };    
                // replace if predefined found
                let urls = dataLine.split(' ').map(p => {
                    let _url = predefined[p.toLowerCase()];
                    return _url ? _url : p;
                });
                // load scripts using callback for each. not chained
                urls.map( s => appendScript(s) );
           }
        },
        {
            command: '/cached',
            help: `shows last command and its cached data`,
            method: () => {
                log(0, `Cached command: ${previousCommand}`);
                const commandObj = findCommandObj(previousCommand, commands);
                log(0, `...with last data: ${JSON.stringify(commandObj.lastData)}`);
            }
        },
        {
            command: '/cls',
            help: `clears the terminal`,
            method: () => {
                setOutput("Termix v" + termix_version, false);
            }
        },
        {
            command: '/exit',
            commandKey: '/kill',  
            help: `removes the terminal`,
            method: () => {
                if (cmdElem && cmdElem.remove) cmdElem.remove(); 
                delete window.termix;                               
                say('termix dead');
            }
        },
        {
            command: '/commands',
            method: () => {
                log(0, commands.map( c => c.command ));
            }
        },
        {
            command: '/help',
            commandKey: '/h',
            method: () => {
                // todo: get help text from all commands, first line for each
                log(1, "should show a list of commands (todo!)");
            }
        }
    ]
;

const
    commandModel = {
        command: '',
        commandKey: '',
        method: (dataObj) => {return 'ready'},
        defaults: {},
        help: ``, 
        mergePolicy: 0,
        askVerification: 0,
        ignoreParse: 0
    },
    domElementModel = { 
        domElement: null,   // this is the static real dom element
        dynamicSelect: '',  // this is the query to eval to get the element
        termixId: ''
    },
    retrieveElement = (elemName, getStored=true) => {
        let _model = domElements.find (el => el.termixId == elemName),
            _el = null;
        if (_model) {
            _el = (_model.domElement && getStored) ? _model.domElement : runEval(_model.dynamicSelect);
        }
        return _el;
    },
    importElement = (domElementObj, allowOverwrite=false) => {
        // do not bother if incoming object is bad
        if (!domElementObj.domElement && !domElementObj.dynamicSelect) {
            return `FAIL: object not valid for: ${domElementObj.termixId}`;   
        }
        if (
            (!allowOverwrite && 
            pushObjectIfUniqueProp(domElements, domElementObj, 'termixId')) 
            ||
            (allowOverwrite && 
            replaceObjectInArray(domElements, domElementObj, 'termixId'))
            ||
            (allowOverwrite && 
            domElements.push(domElementObj))
           )
        {     
            // import is done by condition statement!
            // store the imported id in array
            importedElementsIDs.push(domElementObj.termixId);
            return `success: ${domElementObj.termixId}`; 
        }           
        return `FAIL: termixId duplicate: ${domElementObj.termixId}`;  
    }, 
    findCommand = (word0, seekArr) => {
        let wasCommand = true;
        // seek in array
        let commandIndex = seekArr.findIndex( obj => { return obj.command === word0 || obj.commandKey === word0 });
        // if no command found, this word was not a command, but a param for previous command
        if (commandIndex===-1) wasCommand = false;
        // use previous command if no command            
        if (commandIndex===-1 && useLastCommand) {
            commandIndex = seekArr.findIndex( obj => { return obj.command === previousCommand });
        }         
        return {
            index: commandIndex,
            wasCommand: wasCommand
        }
    },
    findCommandObj = (commandName, commandsArr) => {
        const seekCommandResponse = findCommand(commandName, commandsArr);
        if (seekCommandResponse.index===-1) return {};

        const commandObj = commandsArr[seekCommandResponse.index];
        return commandObj;
    },
    importCommand = (commandObj, allowOverwrite=false) => {
        // ensure command and commandKey is not already in commands array
        let commandFound = commands.findIndex( c => { 
            return (
                c.command && (
                    c.command === commandObj.command || c.command === commandObj.commandKey
                ) ||
                c.commandKey && (
                    c.commandKey === commandObj.commandKey || c.commandKey === commandObj.command
                )
            )
        });
        if (commandFound > -1 && !allowOverwrite) {
            return `FAIL: command ${commandObj.command}/${commandObj.commandKey} cannot be imported, another command uses these keys`
        } else {
            // going to be added, so update the array of imported commands
            importedCommandsNames.push({
                commandKey: commandObj.commandKey,
                command: commandObj.command
            });
            if (commandFound > -1) {
                // overwrite command
                commands[commandFound] = Object.assign({}, commandModel, commandObj);
                return `success overwrite: command ${commandObj.command}/${commandObj.commandKey||"-"}`
            } else {
                commands.push (Object.assign({}, commandModel, commandObj));
                return `success: command ${commandObj.command}/${commandObj.commandKey||"-"}`
            }
        }
    },
    createDataObj = (commandObj, paramsLine) => {
        const bashSyntax = paramsLine.charAt(0)==='-' || !paramsLine;
        if (!bashSyntax) {
            return {
                errMsg: `Non-bash syntax is not supported beyond version 0.3.x`
            } 
        }
        let dataObj = {};
        // put params in pairs into dataObj
        " ".concat(paramsLine)
            .split (" -")
            .splice(1)                   
            .map( pair => { 
                var pairs = pair.replace(" ","*&*").split('*&*'); 
                dataObj[pairs[0]] = pairs[1];
            })
        ;        
        // sanitize provided data
        let validDataObj = {}; 
        Object.keys(dataObj).map( k => { 
            // clear params with no name
            if ( validParamName(k)) {
                // convert undefined to true. (User provided empty string in fact, but it is used as a flag)
                let val = dataObj[k] ? dataObj[k] : true;
                // convert number-string to number 
                if (!isNaN(Number(val))) val = Number(val);
                // store parsed value
                validDataObj[k] = val;        
            }
        });
        // merge with defaults and lastData, following command's mergePolicy
        // priority is always dataObj > lastData > defaults and cannot be changed
        const mergePolicy = commandObj.mergePolicy || 0,
             _defaults = commandObj.defaults || {},
             _lastData = commandObj.lastData || {}
        ;
        let mergedObj = {};
        switch (mergePolicy) {                
            case 1:
                // Caution, required (default) params may not be found
                mergedObj = Object.assign({}, _lastData, validDataObj);
                break;
            case 2:
                mergedObj = Object.assign({}, _defaults, validDataObj);
                break;
            case 3:
                // Caution, required (default) params may not be found
                mergedObj = Object.assign({}, validDataObj);
                break;
            case 0:
            default:
                mergedObj = Object.assign({}, _defaults, _lastData, validDataObj);
        }
        // if there is a change that required (default) params may not be found
        // AND help is not asked
        if (mergePolicy%2 && !Object.keys(validDataObj).includes("help")) {
            // If not all default params found dataObj, then abort command,
            // because all default params are considered required
            const defaultKeys = Object.keys(_defaults), 
                  mergedKeys = Object.keys(mergedObj);
            if (!defaultKeys.every( el => mergedKeys.includes(el))) {
                return {
                    errMsg: `One or more required parameter is missing: ${defaultKeys}`
                }
            }
        }
        return mergedObj;
    },
    historyNavigate = (factor) => {
        if (historyPointer<=0 && factor===-1) {
            // pressed 'down' until first entry
            setInput("");
            // history not in use, set -1
            historyPointer=-1;
            return;
        }
        if (historyPointer==_history.length-1 && factor==1) {
            // pressed 'up' until first entry
            return;
        }
        if (historyPointer===-1 && getInput()) { 
            // auto-save unfinished line in history               
            _history.unshift(_line);
            historyPointer=0;
        }
        // insert line from history & set historyPointer
        setInput(_history[(historyPointer+=factor)]);
    },
    putPreviousData = (commandName, dataObj) => {
        // Normally, termix saves the lastData for which each command operated.
        // But sometimes we might need to alter that data after operation,
        // i.e when se want to reset some params
        const seekCommandResponse = findCommand(commandName, commands);
        if (seekCommandResponse.wasCommand) {
            commands[seekCommandResponse.index].lastData = dataObj;
        }        
    },
    appendScript = (_url) => {
        log(1, `loading script from ${_url}`);
        let tag = document.createElement('script');
        tag.src = _url; 
        tag.onload = function() {
            log(0, _url.split('/').pop()+' loaded\n');
        };
        document.head.appendChild(tag);
    },    
    log = (level, ...args) => {
        if (isNaN(level)) {
            // warning for the developer
            say ('WARNING: log level not defined!');
            level=0;
        }
        if (logLevel >= level) {
            setOutput(`\n ${args}`);
        }
        say(...args);
    },  
    say = (...args) => {
        console.log("___termix: ", ...args);
    },
    rnd = (digits=4) => {
        return (Math.random()+"").substr(-digits); // wrap with Number() ?
    },
    now = () => {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
    },
    runEval = (str) => {
        return eval(str);
    },
    cautiousStringifier = (k, v) => {
        // shows params even with undefined values
        return (v === undefined) ? '__undefined__' : v;
    },
    validParamName = (str) => { 
        return !!str && !!str.trim();
    },
    pushObjectIfUniqueProp = (arr, obj, prop) => {
		// pushes the object in the array if there is no other object with object.prop === val in the array
		const found = arr.some( i => {
			return i[prop] === obj[prop];
        });
		if (!found) arr.push(obj);
		return !found;
    },
    replaceObjectInArray = (arr, obj, prop) => {
        // replace an object in array using prop as id
        let replaced = false;
        arr.forEach( (item, i, _arr) => { 
            if (item[prop] == obj[prop]) {
                _arr[i] = obj;
                replaced = true;
            }
        });
        return replaced;
    },
    setOutput = (txt, append=true) => {
        let preText = "";       
        preText = append ? cmdElem.value : "";
        cmdElem.value = preText + txt;
        cmdElem.scrollTop = cmdElem.scrollHeight;        
    },
    setInput = (txt) => {
        const restText = cmdElem.value.substr(0, cmdElem.value.lastIndexOf("\n")+1);
        cmdElem.value = restText + txt;       
    },
    getInput = () => {
        return cmdElem.value.substr(cmdElem.value.lastIndexOf("\n")+1);      
    },
    getUnparsedLine = (dataLine) => {
        const spaced = dataLine.trim().split(' ');
        spaced.shift();
        return spaced.join(' ');
    },
    parseLine = (dataLine, keepInHistory=true) => {
        dataLine = dataLine.trim();
        if (!dataLine) return;
        if (keepInHistory) {
            // set historyPointer to -1
            historyPointer = -1;
            // keep line in History in zero index if not same as previous
            if (_history[0] != dataLine) _history.unshift(dataLine);
        }
        // trim spaces & get the first word to check if it is a command
        const spaced = dataLine.split(' ');
        let word0 = spaced[0];
        // search in specialCommands or in commands
        const isSpecial = word0.charAt(0)==='/',
              seekArr = isSpecial ? specialCommands:commands, 
              seekCommandResponse = findCommand(word0, seekArr)
        ;
        if (seekCommandResponse.index===-1) {
            log(0, `'${word0}': ${isSpecial?'special ':''}command not found. ${isSpecial?'':'Previous command not available.'}`);
            return;              
        }
        // remove first word if it was a command 
        const paramsLine = dataLine.split(" ").splice(seekCommandResponse.wasCommand).join(" "); 
        const commandObj = seekArr[seekCommandResponse.index];
        const unparsedLine = getUnparsedLine(dataLine);
        if (commandObj.command == '/eval') {
            // stop typical procedure and return eval
            if (allowEval) {
                // remove /eval from data line and evaluate
                let evalReturn = '';
                try {
                    evalReturn = runEval(unparsedLine);
                    log(1, evalReturn);
                } catch (err) {
                    evalReturn = err.message;
                    log(0, evalReturn);
                }
                return;
            } else {
                log(0, `'allow-eval' setting is off. Use /opts to change it`);
                return; 
            }
        }
        // create dataObj (plain object, not json) from params string
        let dataObj = commandObj.ignoreParse ?
            unparsedLine :        
            createDataObj(commandObj, paramsLine)
        ;
        if (dataObj.errMsg) {                
            log(0, `'${commandObj.command}': syntax error. ${dataObj.errMsg}`);
            return;              
        }
        // check if user asked help for the command
        if (Object.keys(dataObj).includes('help')) {
            log(1, `'${commandObj.command}' help: ${commandObj.help}`);
            if (Object.keys(dataObj).length>1) {
                // show how command params would run if no '-help' was present
                log(1, `'${commandObj.command}' previous params: ${JSON.stringify(commandObj.lastData, cautiousStringifier)}`);                
                log(1, `'${commandObj.command}' parsed params  : ${JSON.stringify(dataObj, cautiousStringifier)}`);
            }
            return;
        }
        return {
            commandObj : commandObj,
            dataObj : dataObj,
            seekArr : seekArr,
            isSpecial : isSpecial,
            commandIndex : seekCommandResponse.index,
        };        
    },
    execute = (commandObj, dataObj={}, commandArr=[{}], isSpecial=false, commandIndex=-1, keepInHistory=false) => {
        let methodOutput = "";
        if (isSpecial) {
            // if there are params, look for settingsMapper, else, run method
            const providedParams = Object.keys(dataObj);
            if (commandObj.settingsMapper && providedParams.length>0) {
                // iterate dataObj to see what params will run actions for
                providedParams.map( key => {
                    const mappedParamObj = commandObj.settingsMapper.find( paramElem => paramElem.param == key);
                    if (mappedParamObj) {
                        // per param, run the settingsMapper action for param value 
                        mappedParamObj.action(dataObj[key]);
                    }
                });
            }
            else if (commandObj.method) {
                methodOutput = commandObj.method(dataObj);
            }
            else {
                log(0, `'${commandObj.command}': no action nor method found to run`);
                return;
            }  
        } else {
            if (keepInHistory) {
                // store as previous command only if typed by user
                previousCommand = commandObj.command;
                // keep dataObj in command's lastData
                if (commandIndex > -1) commandArr[commandIndex].lastData = dataObj;
            }            
            // run command method from the commands array. This should be the last thing to do
            methodOutput = commandObj.method(dataObj);            
        }
        // log details
        log(3, `command:${commandObj.command} dataObj:${JSON.stringify(dataObj, cautiousStringifier)}`);
        // show the response if any
        if (methodOutput) {
            log(1, `'${commandObj.command}': ${JSON.stringify(methodOutput)}`);
        }          
    },
    apply = (commandName, params) => {
        let foundArr = specialCommands;
        let seekCommandResponse = findCommand(commandName, specialCommands);
        if (seekCommandResponse.index===-1) {
            foundArr = commands;
            seekCommandResponse = findCommand(commandName, commands);
        }        
        if (seekCommandResponse.index===-1)  return;
        execute(findCommandObj(commandName, foundArr), params, foundArr);
    },
    handleEnter = (dataLine, keepInHistory=false) => {
        parseData = parseLine(dataLine, keepInHistory);
        if (!parseData) return;
        const {commandObj, dataObj, seekArr, isSpecial, commandIndex} = parseData;        
        // check if should execute the command
        if (!commandObj.askVerification) {
            // ready to run the command
            execute(commandObj, dataObj, seekArr, isSpecial, commandIndex, keepInHistory);
        } else {
            log(1, `${commandObj.command} : ${JSON.stringify(dataObj, cautiousStringifier)}`);
            setVerify("Are you sure? (y/n)", parseData);
        }
    },
    init = (where, appendMode=0) => {
        // appendMode: 0: append (default), 1: prepend, 2: replace
        // init accepts string for selector or dom object or no param.        
        let el = null;
        if (typeof (where) === "string") {
            // try for element id if id/class symbols missing
            if (!where.startsWith("#")&&!where.startsWith(".")) where = "#"+where;
            el = document.querySelector(where);
        } else if (where != null && typeof (where) === "object") {
            // presume we got a DOM element
            el = where;
        } else {
            // if no param, look in domElements for the object named '__termixPlaceholder__'           
            el = retrieveElement('__termixPlaceholder__');
            // if not found, use default placeholder
            if (!el) { el = document.head; }
        }
        if (el == null) {
            say('init failed');
            return;
        }
        // remove if already somewhere
        const prevPlaced = document.querySelector("#termix");
        if (prevPlaced) { prevPlaced.remove(); }
        // put termix template in DOM
        if (appendMode == 0) {
            el.outerHTML += templateHTML;
        } else if (appendMode == 1) {
            el.outerHTML = templateHTML + el.outerHTML;            
        } else if (appendMode == 2) {
            el.innerHTML = templateHTML;
        }
        // fork html elements
        cmdElem = document.querySelector('#termix');
        // now the input element is in DOM. Add event listener
        cmdElem.addEventListener('keydown', defaultListener);
    },
    htmlTemplate = (what) => {
        // return current value if value empty, do not clear the template
        if (!what) return templateHTML;
        templateHTML = what;
    }, 
    defaultListener = (e) => {
        const _key = e.which || e.keyCode;
        if (_key === 13) {      // Enter
            handleEnter(getInput(), true); // invoke with keepInHistory:true
        }
        else if (_key === 38) { // Up
            historyNavigate(1);
            e.preventDefault();
        }
        else if (_key === 40) { // Down
            historyNavigate(-1);
            e.preventDefault();
        }
    },
    dialogListener = (e) => {
        const _key = e.which || e.keyCode;
        if (_key === 13) {
            setDialog(dialogData, getInput().trim());
        } else if ( e.ctrlKey && (_key == 67 || _key == 99)) {
            setDialog(dialogData, "__BREAK__");
            e.preventDefault(); 
            return false;
        }
    },
    setDialog = (questionsArr, answer=null) => {
        if (answer == "__BREAK__") {
            cmdElem.removeEventListener('keydown', dialogListener);
            cmdElem.addEventListener('keydown', defaultListener);
            dialogPromiser.reject(dialogData);
            // clear global data holders 
            dialogPromiser.isBusy = false;               
            dialogData = [];
            log(0, "Dialog escaped \n");
            return;
        }        
        let questionSeek = { 
                isClean: answer==null, 
                isComplete: false,
                question: null,
                default: null
            },
            questionsCount = questionsArr.length
        ;        
        if (questionSeek.isClean) {
            // first question to be asked
            questionSeek.question = questionsArr[0].question;
            questionSeek.default = questionsArr[0].default;
        } else {        
            for (const [i, q] of questionsArr.entries()) {
                // store answer from previous question
                if (q.answer === undefined) {
                    questionsArr[i].answer = questionsArr[i].default && answer=='' ?
                        questionsArr[i].default 
                        : 
                        answer;
                    // if not end of array, get next question
                    if ( i+1 < questionsCount) {
                        questionSeek.question = questionsArr[i+1].question;
                        questionSeek.default = questionsArr[i+1].default;
                        break;
                    } else {            
                        questionSeek.isComplete = true;
                    }
                }               
            }
        }
        // set Listeners
        if (questionSeek.isClean) {
            cmdElem.removeEventListener('keydown', defaultListener);
            cmdElem.addEventListener('keydown', dialogListener);
        }
        if (questionSeek.isComplete) {
            cmdElem.removeEventListener('keydown', dialogListener);
            cmdElem.addEventListener('keydown', defaultListener);
            // create ansewrs object
            let answersObj = {};
            for (const [i, q] of questionsArr.entries()) {
                answersObj[q.keyName] = q.answer
            }
            dialogPromiser.resolve(answersObj);
            // clear global data holders 
            dialogPromiser.isBusy = false;               
            dialogData = [];
            return;
        }
        // update global object
        dialogData = questionsArr;
        // prompt for first not answered question
        let prompt = questionSeek.default ?
            `${questionSeek.question} (press enter to accept default: ${questionSeek.default}) `
            :
            `${questionSeek.question} `
        ;
        log(0, prompt);
        // return the promise to the dialog initiator
        if (!dialogPromiser.isBusy) {
            _promised = new Promise((resolve, reject) => {
                dialogPromiser.resolve = resolve;
                dialogPromiser.reject = reject;
            });
            dialogPromiser.isBusy = true;
            return _promised;
        }
    },
    verifyListener = (e) => {
        const _key = e.which || e.keyCode;
        if (_key === 13) {
            const verifyLine = getInput().toLowerCase().trim().charAt(0);
            if (verifyLine == 'y') {
                execute(...Object.values(unverifiedParseData), true);
            } else {
                log(0, 'command aborted');
            }            
            unverifiedParseData = {};
            // restore ui listener
            cmdElem.removeEventListener('keydown', verifyListener);
            cmdElem.addEventListener('keydown', defaultListener);
        }
    },
    setVerify = (promptMsg, parseData) => {
        log(0, promptMsg);
        unverifiedParseData = parseData;
        cmdElem.removeEventListener('keydown', defaultListener);
        cmdElem.addEventListener('keydown', verifyListener);
    } 
; 

let templateHTML = `
<textarea id="termix" style="caret-color:red;width:100%;height:150px;background-color:black;color:olive;border:none;padding:1%;font:16px/20px consolas;">Termix v${termix_version}&#10;</textarea>
`;

termix = {
    models: {
        domElementModel: domElementModel,
        commandModel: commandModel,
    },
    dialog: setDialog,
    run: handleEnter,  
    retrieveElement,
    putPreviousData,
    importCommand,
    importElement,
    htmlTemplate, 
    cmd: cmdElem,
    apply,
    init,
    rnd,
    now,
    say,
    log: (what) => log(0, what),   
    version: () => termix_version,
    kill: () => handleEnter('/exit'),
    show: () => cmdElem.style.display = '',
}

// liberate / expose to window scope
window.termix = termix;  

}(window, window.termix));	

// termix.init();
