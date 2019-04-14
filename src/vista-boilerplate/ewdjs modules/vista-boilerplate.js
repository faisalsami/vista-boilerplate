/**
 * Created by Faisal on 2/3/2015.
 */
module.exports = {
    onSocketMessage: function(ewd){

        var wsMsg = ewd.webSocketMessage;
        var type = wsMsg.type;
        var params = wsMsg.params;
        var sessid = ewd.session.$('ewd_sessid')._value;
        var document = {};
        if(typeof params.callback_id !== 'undefined')
        {
            document.callback_id = params.callback_id;
        }

    },
    webServiceExample: function(ewd){
        var patient = new ewd.mumps.GlobalNode('CLPPats', [ewd.query.id]);
        if (!patient._exists){
            return {error: 'Patient ' + ewd.query.id + ' does not exist'};
        }
        return patient._getDocument();
    }
};

var SetParameters = function(ewd,fparams,sessid){
    var vhtparams = new ewd.mumps.GlobalNode('%zewdSession', ['session', sessid, 'vhtparams']);
    vhtparams._delete();
    vhtparams._setDocument(fparams);
    return;
};
