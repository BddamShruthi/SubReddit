import { LightningElement , api, track} from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import getCommentRecords from '@salesforce/apex/commentController.getCommentRecords';
import getChildCommentRecord from '@salesforce/apex/commentController.getchildCommentRecords';
import {updateRecord } from "lightning/uiRecordApi";
import COMMENT_ID_OBJECT from "@salesforce/schema/Comment__c.Id";
import COMMENT_UPVOTE_FIELD from "@salesforce/schema/Comment__c.Upvotes__c";
import COMMENT_DOWNVOTE_FIELD from "@salesforce/schema/Comment__c.DownVotes__c";
export default class Comments extends LightningElement {

    @api postid;
    @api postName;
    @track CommentRecords;
    @track openReplyPage =false;

    @track subCommentRecords;
    @track parentCommentIds;

    async handleSubComments(event) {
        this.parentCommentIds = event.target.dataset.recordId;
        let recindex = event.currentTarget.dataset.index;

        if (this.parentCommentIds !== '') {
            this.subCommentRecords = await getChildCommentRecord({ parentCommentId: this.parentCommentIds, postIdFromLwc: this.postid });
        }
    }

    handleSuccessCommentPage(){
        this.dispatchEvent(
            new ShowToastEvent( {
                title: 'Comment Submission Result',
                message: 'Comment Submitted Successfully',
                variant: 'success',
                mode: 'sticky'
            } )
        );
        const inputFields = this.template.querySelectorAll( 'lightning-input-field[data-name="Reset"]' );
        if ( inputFields ) {
            inputFields.forEach( field => {
                field.reset();
            } );
        }
    }
    
    handleSuccessCommentPage2(){
        this.dispatchEvent(
            new ShowToastEvent( {
                title: 'Comment Submission Result',
                message: 'Comment Submitted Successfully',
                variant: 'success',
                mode: 'sticky'
            } )
        );
        const inputFields = this.template.querySelectorAll( 'lightning-input-field[data-name="Reset2"]' );
        if ( inputFields ) {
            inputFields.forEach( field => {
                field.reset();
            } );
        }
    }

    connectedCallback() {
        this.getData();
    }
    
    getData() {
        getCommentRecords({
            postIdFromLwc: this.postid
    })
    .then(result => {
        this.CommentRecords = result;
    })
    .catch(error => {
        console.log('result :'+error);
    
        const event = new ShowToastEvent({
            title: 'Error',
            variant: 'error',
            message: error.body.message,
        });
        this.dispatchEvent(event);
        // reset contacts var with null   
        this.CommentRecords = null;
    });
    }

    onClickVote(event){
        let recId = event.target.dataset.recordId;
        let recindex = event.currentTarget.dataset.index;
        console.log('index: '+recindex);
      //CommentRecords
        let upvotesCommentMap = this.CommentRecords[recindex].Upvotes__c;
        let downvotesCommentMap = this.CommentRecords[recindex].DownVotes__c;
        
    if(event.target.name === "UpLike"){
        console.log('before: '+this.CommentRecords[recindex].Upvotes__c);
        upvotesCommentMap = this.CommentRecords[recindex].Upvotes__c + 1;
       try{
        this.CommentRecords[recindex].Upvotes__c =  this.CommentRecords[recindex].Upvotes__c + 1;
       }catch(err){
        console.log('catch error: '+err.message);
       }
        
        console.log('after: '+this.CommentRecords[recindex].Upvotes__c);
    }
    
    if(event.target.name === "DownLike"){
        downvotesCommentMap = this.CommentRecords[recindex].DownVotes__c + 1;
       try{
        this.CommentRecords[recindex].DownVotes__c =  this.CommentRecords[recindex].DownVotes__c + 1;
       }catch(err){
        console.log('catch error: '+err.message);
       }
        
        console.log('after: '+this.CommentRecords[recindex].DownVotes__c);
    }
    
    const fields ={};
    
    const recordInput = {
        fields: fields
    
        };
    
    fields[COMMENT_ID_OBJECT.fieldApiName]= recId;
    fields[COMMENT_UPVOTE_FIELD.fieldApiName] =upvotesCommentMap;
    fields[COMMENT_DOWNVOTE_FIELD.fieldApiName] =downvotesCommentMap;
    
    
    updateRecord(recordInput)
    
    .then((data) => console.log('data update: '+JSON.stringify(data)))
    .catch((error) => console.log(error));
    
    }

    replyToComment(event){

        // let recId = event.target.dataset.recordId;
        // let recindex = event.currentTarget.dataset.index;
        // let upvoteCount = this.subRedditRecord[recindex];
        this.openReplyPage=true;
    }

    onClickSubVote(event){
        let recId = event.target.dataset.recordId;
        let recindex = event.currentTarget.dataset.index;
        console.log('index: '+recindex);
      //CommentRecords
        let upvotesCommentMap = this.subCommentRecords[recindex].Upvotes__c;
        let downvotesCommentMap = this.subCommentRecords[recindex].DownVotes__c;
        
    if(event.target.name === "UpLikeSub"){
        console.log('before: '+this.subCommentRecords[recindex].Upvotes__c);
        upvotesCommentMap = this.subCommentRecords[recindex].Upvotes__c + 1;
       try{
        this.subCommentRecords[recindex].Upvotes__c =  this.subCommentRecords[recindex].Upvotes__c + 1;
       }catch(err){
        console.log('catch error: '+err.message);
       }
        
        console.log('after: '+this.subCommentRecords[recindex].Upvotes__c);
    }
    
    if(event.target.name === "DownLikeSub"){
        downvotesCommentMap = this.subCommentRecords[recindex].DownVotes__c + 1;
       try{
        this.subCommentRecords[recindex].DownVotes__c =  this.subCommentRecords[recindex].DownVotes__c + 1;
       }catch(err){
        console.log('catch error: '+err.message);
       }
        
        console.log('after: '+this.subCommentRecords[recindex].DownVotes__c);
    }
    
    const fields ={};
    
    const recordInput = {
        fields: fields
    
        };
    
    fields[COMMENT_ID_OBJECT.fieldApiName]= recId;
    fields[COMMENT_UPVOTE_FIELD.fieldApiName] =upvotesCommentMap;
    fields[COMMENT_DOWNVOTE_FIELD.fieldApiName] =downvotesCommentMap;
    
    
    updateRecord(recordInput)
    
    .then((data) => console.log('data update: '+JSON.stringify(data)))
    .catch((error) => console.log(error));
    
    }
}