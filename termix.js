(function (window, termix) {
    // console.log('termix', termix);
    if (termix) {
        console.log ('termix already loaded');
        // return; // allow it for faster debug
    }
/**
 * termix - Terminal Expirience
 * This is a UI-command-line utility to help typing the less keystrokes possible.
 * It can be used when a single command has to be used a lot of times.
 * With this util the command can remember its parameters from previous command until gets changed
 * To check what would be parsed, add '-help' or 'help' according to the syntax you use at the eol
 */
let    
    cmdElem = {},
    previousCommand = '',
    _history = [],
    historyPointer = -1,
    logLevel = 1,
    autoEnter = 0,
    commands = [
        {
            command: '',
            commandKey: '',
            method: (dataObj) => {
                // todo maybe eval here?
                // default command
                // custom code to run command operation
            },
            defaults: {},
            lastData: {},
            help: ``, 
            mergePolicy: 0,
            askVerification: 1
        },
        {
            command: 'insert',
            commandKey: 'i',
            method: (dataObj) => {
                return `inserted: ${JSON.stringify(dataObj, cautiousStringifier)}`;              
            },
            defaults: {},
            lastData: {}, 
            help: `help about insert command`,               
            mergePolicy: 0,
            askVerification: 0
        },
        {
            command: 'bulk',
            commandKey: 'b',
            method: (dataObj) => {
                // custom code to run command operation                    
            },
            defaults: {
                who: 'joe',
                did: 'is',
                what: 'awsome',
                when: new Date().toJSON().slice(0,10)
            },
            lastData: {}, 
            help: `sample on how default params work`,               
            mergePolicy: 0,
            askVerification: 1
        }
    ],
    specialCommands = [
        {
            command: '/options',
            commandKey: '/opts',
            help: `syntax: /opts(/options) -merge-policy [number] -log-level [number] -auto-enter [0|1] -verification [0|1]
            -merge-policy [0-3]: changes the mergePolicy for last used command. 
                0: default, merge all,
                1: ignore defaults, merge lastData 
                2: merge defaults, ignore lastData 
                3: ignore all      
            -log-level [0-3]: changes the log detail level
                0: log errors only
                1: default. Log method's output & errors
                2: log level 1 & command line per enter hit
                3: log level 2 & parsed data per enter hit
            -auto-enter [0|1]: if set, just hitting enter will run default command with its cached params
            -verification [0|1]: if set, termix will show dataObj to be executed and ask a verification enter
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
                    param: 'log-level',
                    action: (paramValue) => {
                        logLevel = Number(paramValue);
                        log(1, 'log-level changed to '+paramValue);
                    }
                },
                {
                    param: 'auto-enter',
                    action: (paramValue) => {
                        autoEnter = Number(paramValue);
                        log(1, 'auto-enter changed to '+paramValue);
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
            ]                   
        },
        {
            command: '/clear',
            commandKey: '/c',
            help: `syntax: /c(/clear) -log -history -command -data
            -log: Clears the log textarea/ You can also use /cls
            -history: clears command history
            -command: clears previous command so the default command will be used if no command present in the next line
            -data: clears cached params for the previous command
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
                        setOutput(clearMsg || "Output", false);
                    }
                },
                {
                    param: 'command',
                    action: () => {
                        log(1, `Previous command forgotten: ${previousCommand}`);
                        previousCommand = '';
                    }
                }
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
            command: '/import',
            commandKey: '/import',
            help: `imports custom commands`,
            method: (dataObj) => {
                // todo: imports a new command in commands array
            }
        },
        {
            command: '/history',
            commandKey: '/history',
            help: `logs the history`,
            method: () => {
                log(0, _history);
            }
        },
        {
            command: '/eval',            
            help: `runs pure js`,
            commandKey: '/e',
            method: () => {
                // todo
            }
        },
        {
            command: '/get',
            commandKey: '/get',
            help: `sends a GET request`,
            method: () => {
                // todo ajax get
            }
        },
        {
            command: '/post',
            commandKey: '/post',
            help: `sends a POST request`,
            method: () => {
                // todo ajax post
            }
        },
        {
            command: '/watch',
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
            commandKey: '/s',
            help: `gets, sets, and removes from LocalStorage`,
            method: () => {
                // todo local storage get, set, remove
            }
        },
        {
            command: '/load',
            commandKey: '/l',
            help: `loads js script. Use its URL or short name (jquery, moment)`,
            method: () => {
                // todo: laod scripts
                /*  jquery: https://code.jquery.com/jquery.min.js
                    moment: https://cdn.jsdelivr.net/momentjs/latest/moment.min.js
                    binance: -custom termix commands for binance
                */
           }
        },
        {
            command: '/cached',
            commandKey: '/cached',
            help: `shows last command and its cached data`,
            method: () => {
                log(0, `Cached command: ${previousCommand}`);
                const commandObj = findCommandObj(previousCommand, commands);
                log(0, `...with last data: ${JSON.stringify(commandObj.lastData)}`);
            }
        },
        {
            command: '/cls',
            commandKey: '/cls',
            help: `clears the terminal`,
            method: () => {
                setOutput("Output", false);
            }
        },
        {
            command: '/dialog',
            commandKey: '/question',
            help: `runs a method with user's input after prompt msg`,
            method: () => {
                //todo
            }
        },
        {
            command: '/exit',
            commandKey: '/x',  
            help: `removes the terminal`,
            method: () => {
                // kill the utility, 
                // clear all data
                // remove the appended HTML
                log(1, "should kill the utility");
            }
        },
        {
            command: '/help',
            commandKey: '/h',
            method: () => {
                // outputs a list of special commands
                // todo: get help text from all special commands, first line for each
            }
        }
    ]
;

const
    termix_version = "0.0.2",
    templateHTML = `
    <textarea id="termix" style="caret-color:red;width:100%;height:150px;background-color:black;color:olive;border:none;padding:1%;font:16px/20px consolas;">Output&#10;</textarea>
    `,
    findCommand = (word0, seekArr) => {
        let wasCommand = true;
        // seek in array
        let commandIndex = seekArr.findIndex( obj => { return obj.command === word0 || obj.commandKey === word0 });
        // if no command found, this word was not a command, but a param for previous or default command
        if (commandIndex===-1) wasCommand = false;
        // use previous command if no command            
        if (commandIndex===-1) {
            commandIndex = seekArr.findIndex( obj => { return obj.command === previousCommand });
        }
        // use default command if no previous command
        if (commandIndex===-1) {
            commandIndex = seekArr.findIndex( obj => { return obj.command === '' });
        }            
        return {
            index: commandIndex,
            wasCommand: wasCommand
        }
    },
    findCommandObj = (previousCommand, commandsArr) => {
        const seekCommandResponse = findCommand(previousCommand, commandsArr);
        if (seekCommandResponse.index===-1) return {};

        const commandObj = commandsArr[seekCommandResponse.index];
        return commandObj;
    },
    createDataObj = (commandObj, paramsLine) => {
        /*            
        ============
        scenario 1 - bash syntax (dashes for params): Split with ' -'
                    - case param with null value (examples: clear -unsafe-op, insert -help)
            -bus 123 -date 12-22-93 -text 'this is a bus route'
            /opts -merge-policy 3
            -bus 123 -unsafe -text 'crazy driver' 
            -bus "123" -text 'will this work?' -unsafe-op -help -date 12-22-93
        ============
        scenario 2 - no dashes for params: Regex to replace spaces in quotes, split with spaces, replace back after split
                    - param with null value cannot be used
            bus 123 date 12-22-93 text 'this is a bus route'
            bus 123 date 12-22-93 text "this is a bus route"
            bus 123 date 12-22-93 text "this is a bus route" another-text 'single quoted'
        */
        
        const bashSyntax = paramsLine.charAt(0)==='-';
        let dataObj = {};
        // put params in pairs into dataObj
        if (bashSyntax) {
            " ".concat(paramsLine)
                .split (" -")
                .splice(1)                   
                .map( pair => { 
                    var pairs = pair.replace(" ","*&*").split('*&*'); 
                    dataObj[pairs[0]] = pairs[1];
                })
            ;
        } else {
            // decide on spliter
            let splitter=[], splitters=['"', "`", "'"];
            splitters.map( spl => {
                if (paramsLine.indexOf(spl) > -1) splitter.push(spl);
            });
            if (splitter.length > 1) {
                // quoting mess, abort the operation
                return {
                    errMsg: `Cannot use more than one quote symbol in non-dash syntax. Quotes types found: ${splitter.join(' ')}`
                }
            }
            if ((paramsLine.split(splitter[0]).length-1)%2) {
                // splitter ammount is Odd, some quoting not closed, abort the operation
                return {
                    errMsg: `Quotes count is odd. Use dash syntax to do that`
                }
            }
            paramsLine
                .split (splitter[0])
                .map ( (v,i) => {
                    return i%2 ? v.replace(/\s/g, "&_&") :v ;
                })
                .join ("")
                .split (" ")
                .map (el => { 
                    return el.replace(/&_&/g, " ")
                })
                .map( (value, ind, array) => { 
                    if (ind % 2 === 0 && ind!=array.length) dataObj[value] = array[ind+1]
                })
            ;
        }
        // clear params with no name
        let validDataObj = {}; 
        Object.keys(dataObj).map( k => { 
            if ( validParamName(k)) validDataObj[k] = dataObj[k] 
        });
        // merge with defaults and lastData, following command's mergePolicy
        // priority is always dataObj > lastData > defaults and cannot be changed
        const mergePolicy = commandObj.mergePolicy || 0;
        const _defaults = commandObj.defaults || {};
        const _lastData = commandObj.lastData || {};
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
            // If not all default params found dataObj, then abort command.
            // All default params are considered required
            const defaultKeys = Object.keys(_defaults);
            const mergedKeys = Object.keys(mergedObj);
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
        console.log(...args);
    },
    cautiousStringifier = (k, v) => {
        // shows params even with undefined values
        return (v === undefined) ? '__undefined' : v;
    },
    validParamName = (str) => { 
        return !!str && !!str.trim();
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
    parseLine = () => {
        const dataLine = getInput();
        // if no text, do not keep in history
        if (dataLine.trim()) {
            // set historyPointer to -1
            historyPointer = -1;
            // keep line in History in zero index if not same as previous
            if (_history[0] != dataLine) _history.unshift(dataLine);
        } else {
            // if settings allow it, just hitting enter will run default command with cached params
            if (autoEnter) return;
        }
        // trim spaces & get the first word to check if it is a command
        const spaced = dataLine.trim().split(' ');
        let word0 = spaced[0];
        // search in specialCommands or in commands
        const isSpecial = word0.charAt(0)==='/';
        const seekArr = isSpecial ? specialCommands:commands; 
        const seekCommandResponse = findCommand(word0, seekArr);
        if (seekCommandResponse.index===-1) {
            log(0, `'${word0}': ${isSpecial?'special ':''}command not found. ${isSpecial?'':'Previous & default commands not available.'}`);
            return;              
        }
        // remove first word if it was a command 
        const paramsLine = dataLine.split(" ").splice(seekCommandResponse.wasCommand).join(" "); 
        // get the command object
        const commandObj = seekArr[seekCommandResponse.index];
        if (seekCommandResponse.command == '/eval') {
            // stop typical procedure and return eval
            // todo
        }
        // create dataObj (plain object, not json) from params string
        let dataObj = createDataObj(commandObj, paramsLine);
        if (dataObj.errMsg) {                
            log(0, `'${commandObj.command}': syntax error. ${dataObj.errMsg}`);
            return;              
        }
        // check if user asked help for the command
        if (Object.keys(dataObj).includes('help')) {
            log(0, `'${commandObj.command}' help: ${commandObj.help}`);
            if (Object.keys(dataObj).length>0) {
                // show how command params would run if no '-help' was present
                log(1, `'${commandObj.command}' params parsed: ${JSON.stringify(dataObj, cautiousStringifier)}`);
            }
            return;
        }
        // ready to run the command
        execute(commandObj, dataObj, seekArr, isSpecial, seekCommandResponse.index);
    },
    execute = (commandObj, dataObj, commandArr, isSpecial, commandIndex) => {
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
            // run command method from the commands array
            methodOutput = commandObj.method(dataObj);
            // store as previous command
            previousCommand = commandObj.command;
            // keep dataObj in command's lastData
            commandArr[commandIndex].lastData = dataObj;
        }
        // log details
        log(3, `command:${commandObj.command} dataObj:${JSON.stringify(dataObj, cautiousStringifier)}`);
        // show the response if any
        if (methodOutput) {
            log(1, `'${commandObj.command}': ${JSON.stringify(methodOutput)}`);
        }          
    }
    ui = (where) => {
        if (window.termix_hasBeenInit) {
            say('termix initialized already');
            return;
        }
        // try for element id if id/class symbols missing
        if (!where.startsWith("#")&&!where.startsWith(".")) where = "#"+where;
        const el = document.querySelector(where);
        if  (el == null) {
            say('element id not found');
            return;
        }            
        // append a text input in html and a textArea for logs
        el.outerHTML += templateHTML;
        // fork html elements
        cmdElem = document.querySelector('#termix');
        // fix according to beSafe flag
        const listenerElem = cmdElem;
        // now the input element is in DOM. Add event listener
        listenerElem.addEventListener('keydown', function (e) {
            const _key = e.which || e.keyCode;
            if (_key === 13) {     // Enter
                parseLine();
            }
            else if (_key === 38) { // Up                    
                historyNavigate(1);
                e.preventDefault();
            }
            else if (_key === 40) { // Down
                historyNavigate(-1);
                e.preventDefault();
            }
        });
        window.termix_hasBeenInit = true;
    }
; 

termix = {
    init : ui,
    version: function () { 
        console.log("Hello, termix ver is " + termix_version); 
    }
}

// liberate / expose to window scope
window.termix = termix;  

}(window, window.termix));	


termix.init(".container");

