({
    init: function(cmp, evt, helper) {
        var myPageRef = cmp.get("v.pageReference");
        var postid = myPageRef.state.c__postid;
        var postName = myPageRef.state.c__postName;
        cmp.set("v.postid", postid);
        cmp.set("v.postName", postName);

    }
})