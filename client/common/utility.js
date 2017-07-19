/**
 * Created by avishek on 7/17/17.
 */

var Utility = (function() {

    //getting last message from a conversation based on who had sent
    function getLastMessage(conversation, type) {
        if(!Valid.array(conversation) || !conversation.length) return null;
        var lastMessage = conversation[conversation.length-1];
        if(lastMessage && lastMessage.type === type) return lastMessage;
        return null;
    }

    //adding text in the conversation at proper location
    function addConversation(conversation, text, type) {
        var now = new Date().getTime();
        var lastMessage = getLastMessage(conversation, type);
        if(lastMessage && (now - lastMessage.epoch) < 5000) {
            lastMessage.text.push(text);
            lastMessage.epoch = now;
        }
        else {
            conversation.push({type : type, text : [text], epoch : now});
        }
        return conversation;
    }

    return {
        getLastMessage : getLastMessage,
        addConversation : addConversation
    }


})();