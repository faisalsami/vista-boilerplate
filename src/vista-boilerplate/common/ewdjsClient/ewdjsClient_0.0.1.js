angular.module('ewdjsClient', [])
    .constant('version',{
        build: 21,
        date: '3 October 2014'
    })
    .value('trace',false)
    .value('initialised',false)
    .value('ready', false)
    .value('log', false)
    .value('usenotifications',false)
    .value('ewdsocket',{})
    .value('ewdtoken',{})
    .value('chromecast',{})
    .value('ewdapplication', {
        name: ''
    })
    .value('timeout', 0)
    //This function is not needed here may be in any other module. but keep it here for now
    .value('show', function(id){
        var elem = angular.element(document.querySelector(id));
        if (elem !== null) {
            elem.css("display","");
        }
    })
    //This function is not needed here may be in any other module. but keep it here for now
    .value('hide', function(id){
        var elem = angular.element(document.querySelector(id));
        if (elem !== null) {
            elem.css("display","none");
        }
    })
    //This function is not needed here may be in any other module. but keep it here for now
    .value('insertAfter', function(html, targetId){
        var tag = document.createElement('div');
        tag.innerHTML = html;
    })
    .factory('require', ['ewdapplication',function(ewdapplication){
        return function(options){
            if (typeof require !== 'function') {
                console.log('ERROR: unable to invoke EWD.require as the dependency require.js has not been loaded');
                return;
            }
            // set require config if defined
            if (typeof options.requireConfig === 'object') {
                require.config(options.requireConfig);
            }
            // check if custom namespace is defined
            if (typeof options.nameSpace === 'undefined') {
                options.nameSpace = options.serviceName;
            }
            //console.log('namespace set to: ' + options.nameSpace)

            require([options.serviceName], function(module) {
                function invokeOnServiceReady(options) {
                    if (typeof ewdapplication.onServiceReady === 'object' &&  typeof options.done === 'undefined') {
                        if (typeof ewdapplication.onServiceReady[options.serviceName] === 'function') {
                            ewdapplication.onServiceReady[options.serviceName](module);
                        }
                    }
                    else if (typeof options.done === 'function'){
                        options.done(module);
                    }
                }

                function invokeServiceInit(options, module) {
                    if (typeof module.init === 'function') {
                        //console.log('invoking init with namespace: ' + options.nameSpace);
                        module.init(options.nameSpace);
                    }
                }

                var method;
                // extend onMessage
                if (typeof module.onMessage === 'object') {
                    for (method in module.onMessage) {
                        if (typeof ewdapplication.onMessage === 'undefined') {
                            ewdapplication.onMessage = {};
                        }
                        ewdapplication.onMessage[options.nameSpace+'-'+method] = module.onMessage[method];
                    }
                }
                // extend onFragment
                if (typeof module.onFragment === 'object') {
                    for (method in module.onFragment) {
                        if (typeof ewdapplication.onFragment === 'undefined') {
                            ewdapplication.onFragment = {};
                        }
                        ewdapplication.onFragment[method] = module.onFragment[method];
                    }
                }
                // set correct fragmentName
                var fragmentName = false;
                var useServiceDirectory = true;
                if (typeof options.fragmentName !== 'boolean' && options.fragmentName !== false) {
                    if (typeof options.fragmentName === 'string' && options.fragmentName.length > 0) {
                        fragmentName = options.fragmentName;
                        useServiceDirectory = false;
                    }
                    else if (typeof module.fragmentName === 'string' && module.fragmentName.length > 0) {
                        fragmentName = module.fragmentName;
                    }
                    else if (typeof module.fragmentName === 'boolean' && module.fragmentName === false) {
                        fragmentName = false;
                    }
                    else {
                        //console.log('default fragment')
                        fragmentName = options.serviceName + '.html';
                    }
                }

                // fetch fragment if fragmentName is supplied
                if (fragmentName) {
                    // clone onFragment to overwrite & extend it with
                    if (typeof ewdapplication.onFragment[fragmentName] === 'function') {
                        var _onFragment = ewdapplication.onFragment[fragmentName];
                    }
                    EWD.getFragment(fragmentName, options.targetSelector, function(messageObj, fragmentError) {
                        if (fragmentError) { // revert this handler back if fetching the fragment failed
                            ewdapplication.onFragment[fragmentName] = _onFragment;
                        }
                        else {
                            if (typeof _onFragment === 'function'){
                                _onFragment(messageObj);
                            }
                            invokeServiceInit(options, module);
                            invokeOnServiceReady(options);
                            // restore original onFragment handler
                            // prevents EWD.application.onFragment[fragmentName] from being continually extended by this
                            if (typeof _onFragment === 'function') {
                                ewdapplication.onFragment[fragmentName] = _onFragment;
                            }
                        }
                    },useServiceDirectory);
                }
                // no fragment to fetch, just run the init and service callbacks
                else {
                    invokeServiceInit(options,module);
                    invokeOnServiceReady(options);
                }
                // reset baseUrl for services if they were overridden
                if (typeof options.requireConfig === 'object') {
                    require.config({
                        baseUrl: ewdapplication.getServicePath()
                    });
                }
            });
        };
    }])
    //This function is not needed here may be in any other module. but keep it here for now
    .value('ewdjson2XML', function(document, tagName, xml){
        if (!xml){
            xml = '';
        }
        var intRegex = /^\d+$/;
        var numericTagName = intRegex.test(+tagName);
        //console.log('tagName: ' + tagName);
        if (tagName && !numericTagName){
            xml = xml + '<' + tagName;
        }
        var hasAttributes = false;
        var hasChildren = false;
        var property;
        var value;
        var text = '';

        for (property in document) {
            if (property.substring(0,1) === '#') {
                hasAttributes = true;
            }
            else if (property === '.text') {
                text = document[property];
            }
            //else if (!intRegex.test(property)) {
            else {
                hasChildren = true;
            }
        }

        if (hasAttributes) {
            for (property in document) {
                if (property.substring(0,1) === '#') {
                    xml = xml + ' ' + property.substring(1) + '="' + document[property] + '"';
                }
            }
        }
        if (tagName && !numericTagName && hasChildren){
            xml = xml + '>';
        }

        if (hasChildren) {
            for (property in document) {
                if (property.substring(0,1) !== '#') {
                    if (typeof document[property] === 'object') {
                        xml = this.json2XML(document[property], property, xml);
                    }
                    else {
                        value = document[property];
                        if (value !== '') {
                            xml = xml + '<' + property + '>' + value + '</' + property + '>';
                        }
                        else {
                            xml = xml + '<' + property + ' />';
                        }
                    }
                }
            }
            if (tagName && !numericTagName){
                xml = xml + '</' + tagName + '>';
            }
            return xml;
        }

        if (text !== '' && tagName) {
            xml = xml + '>' + text + '</' + tagName + '>';
            return xml;
        }

        xml = xml + ' />';
        return xml;
    })
    //This function is not needed here may be in any other module. but keep it here for now
    .factory('utils', [function(){
        var addOption =function(selectTag, value, text) {
            var optionTag = document.createElement('option');
            optionTag.setAttribute('value', value);
            optionTag.text = text;
            try {
                // for IE earlier than version 8
                selectTag.add(optionTag, selectTag.options[null]);
            }
            catch (err) {
                selectTag.add(optionTag,null);
            }
        };
        var addOptions = function(options, selectTagId) {
            // EWD.utils.addOptions([{value: 'John', text: 'John Smith'}], 'doctor');
            if (options instanceof Array) {
                var selectTag = angular.element(document.querySelector(selectTagId));
                //var selectTag = document.getElementById(selectTagId);
                for (var i = 0; i < options.length; i++) {
                    addOption(selectTag, options[i].value, options[i].text);
                }
            }
        };
        return {
            addOptions: addOptions
        };
    }])
    .value('ewdonSocketMessage', {})
    .factory('$ewdsocket', ['$window','$rootScope','$q','$log','$interval','ewdsocket','ewdapplication','trace','initialised','ready','log','ewdtoken','ewdonSocketMessage','timeout','usenotifications','chromecast', function ($window,$rootScope,$q,$log,$interval,ewdsocket,ewdapplication,trace,initialised,ready,log,ewdtoken,ewdonSocketMessage,timeout,usenotifications,chromecast) {
        var ewdonSocketMessageHandle = function(obj){
            if(typeof ewdonSocketMessage !== 'undefined'){
                if(typeof ewdonSocketMessage.function !== 'undefined'){
                    ewdonSocketMessage.function(obj);
                    return;
                }
                else{
                    $log.error('Listener is not defined for the message ' + obj.type);
                }
            }
            else{
                $log.error('Listener is not defined for the message ' + obj.type);
            }
        };
        var socket = {};
        var sendMessage = function(type,inparams) {
            var defer = $q.defer();
            var params = {};
            params.type = type;
            if (typeof inparams == 'undefined'){
                inparams = {};
            }
            if (typeof inparams != 'undefined'){
                params.params = inparams;
            }
            params.token = ewdtoken;
            if (typeof params.type === 'undefined') {
                if (log){
                    $log.log('Message not sent: type not defined');
                }
            } else {
                if (inparams.done) {
                    if (type === 'EWD.getFragment') {
                        if (!ewdapplication.onFragment){
                            ewdapplication.onFragment = {};
                        }
                        ewdapplication.onFragment[inparams.params.file] = inparams.done;
                    }
                    else {
                        if (!ewdapplication.onMessage){
                            ewdapplication.onMessage = {};
                        }
                        ewdapplication.onMessage[type] = inparams.done;
                    }
                    delete inparams.done;
                }
                if (inparams.ajax && typeof $ !== 'undefined') {
                    delete inparams.ajax;
                    $.ajax({
                        url: '/ajax',
                        type: 'post',
                        data: JSON.stringify(inparams),
                        dataType: 'json',
                        timeout: 10000
                    })
                        .done(function (data) {
                            if (log){
                                $log.log("onMessage: " + JSON.stringify(data));
                            }
                            // invoke the message handler function for returned type
                            if (ewdapplication && ewdapplication.onMessage && ewdapplication.onMessage[data.type]) {
                                ewdapplication.onMessage[data.type](data);
                                data = null;
                            }
                        });
                }
                else {
                    var callbackId = getCallbackId();
                    var cobj = {
                        time: new Date(),
                        id: callbackId,
                        cb: defer
                    };
                    callbacks.push(cobj);
                    params.params.callback_id = callbackId;
                    if (log){
                        $log.log("sendMessage: " + JSON.stringify(params, null, 2));
                    }
                    socket.json.send(JSON.stringify(params));
                    if (usenotifications) {
                        var stop = $interval(function () {
                            // notify here on every 10 ms
                            defer.notify(1);
                        }, 10);
                        cobj.stop = stop;
                    }
                    return defer.promise;
                }
            }
        };
        var callbacks = [];
        var currentCallbackId = 0;
        var getCallbackId = function getCallbackId() {
            currentCallbackId += 1;
            if(currentCallbackId > 10000) {
                currentCallbackId = 0;
            }
            return currentCallbackId;
        };
        var callbyCallbackId = function(callbackid,message){
            var found = false;
            angular.forEach(callbacks, function(value, key) {
                if(value.id == callbackid){
                    if(usenotifications){
                        $interval.cancel(value.stop);
                    }
                    $rootScope.$apply(value.cb.resolve(message));
                    found = true;
                }
            });
            return found;
        };
        var removeCallbackbyId = function(callbackid){
            var rkey = -1;
            angular.forEach(callbacks, function(value, key) {
                if(value.id == callbackid){
                    rkey = key;
                }
            });
            if(rkey > -1){
                callbacks.splice(rkey, 1);
            }
        };
        var Start = function(callback) {
            if (!ready) {
                startSession(callback);
                /*body.addEventListener('socketsReady', function(e) {
                 if (EWD.onSocketsReady) EWD.onSocketsReady();
                 });*/
                //body.dispatchEvent(EWD.readyEvent);
                ready = true;
            }
        };
        var startSession = function(messageFunction) {
            if (ewdapplication && ewdapplication.chromecast) {
                ewdapplication.parentOrigin = 'https://ec2.mgateway.com:8080';
                window.addEventListener('message', function(e) {
                    var message = e.data;
                    //if (EWD.sockets.log) console.log("*** message received from Receiver parent: " + JSON.stringify(message) + ': origin = ' + e.origin);
                    if (e.origin === ewdapplication.parentOrigin) {
                        var type = message.message.type;
                        if (typeof chromecast.onMessage !== 'undefined' && chromecast.onMessage[type]) {
                            chromecast.onMessage[type](message);
                        }
                    }
                });
                chromecast.sendMessage = function(message) {
                    window.parent.postMessage(message, ewdapplication.parentOrigin);
                };
            }

            socket = io.connect();
            ewdsocket = socket;
            socket.on('disconnect', function() {
                if (log){
                    $log.log('socket.io disconnected');
                }
            });
            socket.on('message', function(obj){
                if (log) {
                    if (obj.type !== 'EWD.registered') {
                        $log.log("onMessage: " + JSON.stringify(obj));
                    }
                    else {
                        $log.log('Registered successfully');
                    }
                }
                if (ewdapplication) {
                    if (socket && obj.type === 'EWD.connected') {
                        var json = {
                            type: 'EWD.register',
                            application: ewdapplication
                        };
                        socket.json.send(JSON.stringify(json));
                        return;
                    }
                }
                else {
                    $log.log('Unable to register application: EWD.application has not been defined');
                    return;
                }

                if (obj.type === 'EWD.registered') {
                    if (typeof require === 'function') {
                        // add tailing / to path if necessary
                        if (obj.servicePath.slice(-1) !== '/'){
                            obj.servicePath += '/';
                        }
                        require.config({
                            baseUrl:obj.servicePath
                        });
                        // expose method to retrieve servicePath
                        ewdapplication.getServicePath = function() {
                            return obj.servicePath;
                        };
                    }
                    //$log.log('on register');
                    ewdtoken = obj.token;
                    initialised = true;
                    if(typeof messageFunction !== 'undefined'){
                        messageFunction();
                    }
                    return;
                }

                if (obj.message) {
                    var payloadType = obj.message.payloadType;
                    var i;
                    if (payloadType === 'innerHTMLReplace') {
                        var replacements = obj.message.replacements;
                        var replacement;
                        var prefix;
                        for (i = 0; i < replacements.length; i++) {
                            replacement = replacements[i];
                            prefix = replacement.prefix || '';
                            for (var idName in replacement.ids) {
                                var elem = angular.element(document.querySelector(prefix + idName));
                                elem.innerHTML = replacement.ids[idName];
                                //document.getElementById(prefix + idName).innerHTML = replacement.ids[idName];
                            }
                        }
                    }
                    if (payloadType === 'bootstrap') {
                        var action = obj.message.action;
                        if (action === 'replaceTables') {
                            var tables = obj.message.tables;
                            var tableNo;
                            var table;
                            //var i;
                            var html;
                            var tableTag;
                            var columns;
                            var colNo;
                            var row;
                            for (tableNo = 0; tableNo < tables.length; tableNo++) {
                                table = tables[tableNo];
                                tableTag = angular.element(document.querySelector(table.id));
                                html = '<thead><tr>';
                                columns = EWD.bootstrap.table[table.id].columns;
                                for (i = 0; i < columns.length; i++) {
                                    if (columns[i].heading !== ''){
                                        html = html + '<th>' + columns[i].heading + '</th>';
                                    }
                                }
                                html = html + '</tr></thead>';
                                html = html + '<tbody>';
                                for (i = 0; i < table.content.length; i++) {
                                    row = table.content[i];
                                    html = html + '<tr>';
                                    for (colNo = 0; colNo < columns.length; colNo++) {
                                        html = html + '<td>' + row[columns[colNo].id] + '</td>';
                                    }
                                    html = html + '</tr>';
                                }
                                html = html + '</tbody>';
                                tableTag.innerHTML = html;
                            }
                            if (typeof ewdapplication.onReplacedTables === "function") { // invoke onReplaceTables() after tables are built
                                ewdapplication.onReplacedTables();
                            }
                        }
                    }
                }
                if (obj.type.indexOf('EWD.form.') !== -1) {
                    if (obj.error) {
                        var alertTitle = 'Form Error';
                        if (obj.alertTitle){
                            alertTitle = obj.alertTitle;
                        }
                        if (ewdapplication.framework === 'extjs') {
                            Ext.Msg.alert(alertTitle, obj.error);
                        }
                        else if (ewdapplication.framework === 'bootstrap') {
                            if (typeof toastr !== 'undefined') {
                                toastr.clear();
                                toastr.error(obj.error);
                            }
                            else {
                                if (log){
                                    console.log("error = " + obj.error);
                                }
                                $('#' + ewdapplication.popover.buttonId).popover('show');
                                $('#' + ewdapplication.popover.container).find('div.popover-content').html(obj.error);
                            }
                        }
                        else {
                            alert(obj.error);
                        }
                        return;
                    }
                    else {
                        if (ewdapplication.framework === 'bootstrap') {
                            $('#loginBtn').popover('hide');
                        }
                    }
                }
                if (obj.type.indexOf('EWD.error') !== -1) {
                    if (obj.error) {
                        if (trace){
                            $log.log(obj.error);
                        }
                    }
                    return;
                }
                if (obj.type === 'EWD.getFragment') {
                    if (obj.message.error) {
                        console.log('ERROR: target fragment ' + obj.message.file + ' could not be loaded');
                        if (obj.message.isServiceFragment) {
                            ewdapplication.onFragment[obj.message.file](obj,true);
                        }
                    }
                    if (obj.message.targetId) {
                        // check jQuery is loaded, targetId is valid jQuery selector and selector matches 1+ elements
                        if (window.jQuery && $(obj.message.targetId) instanceof jQuery && $(obj.message.targetId).length > 0) { // handle a jquery object
                            // inject fragment to each matched element
                            $(obj.message.targetId).each(function(ix,element) {
                                $(element).html(obj.message.content);
                            });
                            // invoke onFragment handler
                            if (ewdapplication.onFragment) {
                                if (ewdapplication.onFragment[obj.message.file]){
                                    ewdapplication.onFragment[obj.message.file](obj);
                                }
                            }
                        }
                        // otherwise use jQuery-less fragment target handling
                        else if (document.getElementById(obj.message.targetId)){ // handle as string id
                            document.getElementById(obj.message.targetId).innerHTML = obj.message.content;
                            if (ewdapplication.onFragment) {
                                if (ewdapplication.onFragment[obj.message.file]){
                                    ewdapplication.onFragment[obj.message.file](obj);
                                }
                            }
                        }
                    }
                    return;
                }
                if (obj.type.indexOf('EWD.inject') !== -1) {
                    if (obj.js) {
                        if (trace){
                            console.log(obj.js);
                        }
                        try {
                            eval(obj.js);
                            if (obj.fn){
                                eval(obj.fn);
                            }
                        }
                        catch(error) {
                            if (trace) {
                                console.log('EWD.inject failed:');
                                console.log(error);
                            }
                        }
                    }
                    return;
                }
                if(typeof obj.message.callback_id != 'undefined'){
                    if(callbyCallbackId(obj.message.callback_id,obj.message)){
                        removeCallbackbyId(obj.message.callback_id);
                    }else{
                        $log.log('no callback id found for message ' + obj.type);
                    }
                    return;
                }
                if (ewdonSocketMessageHandle) {
                    ewdonSocketMessageHandle(obj);
                    obj = null;
                    return;
                }
            });
        };
        var keepAlive = function(mins) {
            timeout = mins;
            setTimeout(function() {
                //sendMessage({type: "keepAlive", message:  "1"});
                sendMessage('keepAlive');
                keepAlive(timeout);
            },timeout*60000);
        };
        var submitForm = function(params) {
            var framework = ewdapplication.framework || 'extjs';
            var payload = params.fields;
            if (framework === 'extjs') {
                payload = Ext.getCmp(params.id).getValues();
            }
            if (framework === 'bootstrap') {
                if (params.popover) {
                    ewdapplication.popover = params.popover;
                    if (!ewdapplication.popovers){
                        ewdapplication.popovers = {};
                    }
                    if (!ewdapplication.popovers[params.popover.buttonId]) {
                        $('#' + params.popover.buttonId).popover({
                            title: params.alertTitle || 'Error',
                            content: 'Testing',
                            placement: 'top',
                            container: '#' + params.popover.container,
                            trigger: 'manual'
                        });
                        $('#' + params.popover.buttonId).on('shown.bs.popover', function() {
                            var time = params.popover.time || 4000;
                            setTimeout(function() {
                                $('#' + params.popover.buttonId).popover('hide');
                            },time);
                        });
                        ewdapplication.popovers[params.popover.buttonId] = true;
                    }
                }
                if (params.toastr) {
                    if (params.toastr.target) {
                        toastr.options.target = '#' + params.toastr.target;
                    }
                    else {
                        toastr.options.target = 'body';
                    }
                }
            }
            if (params.alertTitle){
                payload.alertTitle = params.alertTitle;
            }
            //payload.js_framework = framework;
            if (params.done){
                payload.done = params.done;
            }
            sendMessage(params.messageType,payload);
        };
        var EnableTrace = function()
        {
            trace = true;
        };
        var DisableTrace = function()
        {
            trace = false;
        };
        var EnableLog = function()
        {
            log = true;
        };
        var DisableLog = function()
        {
            log = false;
        };
        var EnableNotification = function()
        {
            usenotifications = true;
        };
        var DisableNotification = function()
        {
            usenotifications = false;
        };
        var SetApplication = function(appobj){
            ewdapplication = appobj;
            $rootScope.applicationName = appobj.displayname;
        };
        var getFragment = function(file, targetId, onFragment, isServiceFragment) {
            var params =  {
                file: file,
                targetId: targetId
            };
            if (typeof isServiceFragment === 'boolean' && isServiceFragment) {
                params.isServiceFragment = true;
            }
            if (onFragment){
                params.done = onFragment;
            }
            sendMessage('EWD.getFragment',params);
        };
        return{
            sendMessage: sendMessage,
            Initialize: Start,
            EnableTrace: EnableTrace,
            DisableTrace: DisableTrace,
            EnableLog: EnableLog,
            DisableLog: DisableLog,
            EnableNotification: EnableNotification,
            DisableNotification: DisableNotification,
            SetApplication: SetApplication,
            getFragment : getFragment,
            KeepAlive: keepAlive
        };

    }]);