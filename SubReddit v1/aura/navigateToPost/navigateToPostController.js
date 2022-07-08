({
    init: function(cmp, evt, helper) {
        var myPageRef = cmp.get("v.pageReference");
        var redditid = myPageRef.state.c__redditid;
        var redditName = myPageRef.state.c__redditName;
        cmp.set("v.redditid", redditid);
        cmp.set("v.redditName", redditName);
    },

    reInit : function(component, event, helper) {
        $A.get('e.force:refreshView').fire();
    }
})