import { LightningElement ,track, api} from 'lwc';

import {updateRecord, createRecord } from "lightning/uiRecordApi";
import POST_ID_FIELD from "@salesforce/schema/Post__c.Id";
import POST_UPVOTES_FIELD from "@salesforce/schema/Post__c.No_Of_Upvotes__c";
import POST_DOWNVOTES_FIELD from "@salesforce/schema/Post__c.No_Of_Downvotes__c";
import getPostSearchkey from '@salesforce/apex/postController.postSearchkey';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import COMMENT_OBJECT from "@salesforce/schema/Comment__c";
import COMMENT_POST_FIELD from "@salesforce/schema/Comment__c.Post__c";
import COMMENT_BODY2_FIELD from "@salesforce/schema/Comment__c.Body2__c";
import { NavigationMixin } from 'lightning/navigation';
import Id from '@salesforce/user/Id';
import VOTE_OBJECT from "@salesforce/schema/Vote__c";
import VOTE_SOURCEID_FIELD from "@salesforce/schema/Vote__c.Source_Id__c";
import VOTE_VOTECHECKBOX_FIELD from "@salesforce/schema/Vote__c.Vote__c";
import USER from '@salesforce/schema/Vote__c.User__c';
import VOTE_ID_FIELD from "@salesforce/schema/Vote__c.Id";

export default class PostPage extends NavigationMixin(LightningElement) {

@track userId=Id;
@api redditid;
@api redditName;
@track searchPostValue='';
@track accordianSection='';
@track postRecord=[];
@track isModalOpen = false;
@track upvotesPostMap = new Map();
@track downvotesPostMap = new Map();
openModal() {
    // to open modal set isModalOpen tarck value as true
    this.isModalOpen = true;
}
closeModal() {
    // to close modal set isModalOpen tarck value as false
    this.isModalOpen = false;
}

handleSuccess( event ) {
    this.dispatchEvent(
        new ShowToastEvent( {
            title: 'Post Submission Result',
            message: 'Post Created Successfully',
            variant: 'success',
            mode: 'sticky'
        } )
    );
    this.isModalOpen = false;
    this.getData();
}

handleSuccessComment(){
    this.dispatchEvent(
        new ShowToastEvent( {
            title: 'Comment Submission Result',
            message: 'Comment Submitted Successfully',
            variant: 'success',
            mode: 'sticky'
        } )
    );
    const inputFields = this.template.querySelectorAll( 'lightning-input-field[data-name="ResetPost"]' );
    if ( inputFields ) {
        inputFields.forEach( field => {
            field.reset();
        } );
    }
  }

 postSearchKeyword(event) {
    this.searchPostValue = event.target.value;
    if (this.searchPostValue !== '') {
        getPostSearchkey({
            postSearchKey: this.searchPostValue,
            redditids: this.redditid,
            userId: this.userId
            })
            .then(result => {
                this.postRecord = result;
                console.log('*this.postRecord*'+JSON.stringify(this.postRecord));
            })
            .catch(error => {
                console.log('result :'+error); 
                this.postRecord = null;
            });
    } 
    if (this.searchPostValue == ''){
        this.getData();
    }
}


  //Another way of doing Imperative apex
// async postSearchKeyword(event) {
//     this.searchPostValue = event.target.value;
//     if (this.searchPostValue !== '') {
//         this.postRecord = await getPostSearchkey({ postSearchKey: this.searchPostValue, redditids: this.redditid });
//     }
//     if (this.searchPostValue == ''){
//     }
// }


connectedCallback() {
    this.getData();
}

getData() {
    getPostSearchkey({
        postSearchKey: '',
        redditids: this.redditid,
        userId: this.userId
})
.then(result => {
    this.postRecord = result;
})
.catch(error => {
    console.log('result :'+error);
    this.postRecord = null;
});
this.dispatchEvent(new CustomEvent('recordChange'));
}


//update likes and dislikes
onClickVote(event){
    let recId = event.target.dataset.recordId;
    let recindex = event.currentTarget.dataset.index;
    console.log('index: '+recindex);

  //postRecord
    let upvotesPostMap = this.postRecord[recindex].postRec.No_Of_Upvotes__c;
    let downvotesPostMap = this.postRecord[recindex].postRec.No_Of_Downvotes__c;
    
    if(event.target.name === "UpLike"){
        upvotesPostMap = this.postRecord[recindex].postRec.No_Of_Upvotes__c + 1;
        if(this.postRecord[recindex].postRec.No_Of_Downvotes__c >0 ){
        downvotesPostMap = this.postRecord[recindex].postRec.No_Of_Downvotes__c - 1;
        }
        if(this.postRecord[recindex].voterec != null && this.postRecord[recindex].voterec.Vote__c == true){
            this.postRecord[recindex].upLike = true;
            this.postRecord[recindex].downLike = false;
        }else if(this.postRecord[recindex].voterec != null && this.postRecord[recindex].voterec.Vote__c == false){
            this.postRecord[recindex].upLike = true;
            this.postRecord[recindex].downLike = false;
        }else{
            this.postRecord[recindex].upLike = true;
            this.postRecord[recindex].downLike = false;
        }
       
       try{
        this.postRecord[recindex].postRec.No_Of_Upvotes__c =  this.postRecord[recindex].postRec.No_Of_Upvotes__c + 1;
        if(this.postRecord[recindex].postRec.No_Of_Downvotes__c > 0 ){
        this.postRecord[recindex].postRec.No_Of_Downvotes__c =  this.postRecord[recindex].postRec.No_Of_Downvotes__c - 1;
        }
       }
       catch(err){
        console.log('catch error: '+err.message);
       }
       this.voteCreation(event);
    }
    if(event.target.name === "DownLike"){
        downvotesPostMap = this.postRecord[recindex].postRec.No_Of_Downvotes__c + 1;
        if(this.postRecord[recindex].postRec.No_Of_Upvotes__c >0 ){
        upvotesPostMap = this.postRecord[recindex].postRec.No_Of_Upvotes__c - 1;
        }
        if(this.postRecord[recindex].voterec != null && this.postRecord[recindex].voterec.Vote__c == false){
            this.postRecord[recindex].downLike = true;
            this.postRecord[recindex].upLike = false;
        }else if(this.postRecord[recindex].voterec != null && this.postRecord[recindex].voterec.Vote__c == true){
            this.postRecord[recindex].downLike = true;
            this.postRecord[recindex].upLike = false;
        }else{
            this.postRecord[recindex].upLike = false;
            this.postRecord[recindex].downLike = true;
        }
       
      
       try{
        this.postRecord[recindex].postRec.No_Of_Downvotes__c =  this.postRecord[recindex].postRec.No_Of_Downvotes__c + 1;
        if(this.postRecord[recindex].postRec.No_Of_Upvotes__c >0){
        this.postRecord[recindex].postRec.No_Of_Upvotes__c =  this.postRecord[recindex].postRec.No_Of_Upvotes__c - 1;
        }
       }catch(err){
        console.log('catch error: '+err.message);
       }
       this.voteCreation(event);
    }

const fields ={};

const recordInput = {
    fields: fields
    };

fields[POST_ID_FIELD.fieldApiName]= recId;
fields[POST_UPVOTES_FIELD.fieldApiName] =upvotesPostMap;
fields[POST_DOWNVOTES_FIELD.fieldApiName] =downvotesPostMap;


updateRecord(recordInput)

.then((data) => console.log('data update: '+JSON.stringify(data)))
.catch((error) => console.log(error));

}

//Create Vote record or Update previous Vote record
voteCreation(event){

    let recindex = event.target.dataset.index;
    if(this.postRecord[recindex].voterec == null){
        const fields ={};
        fields[VOTE_SOURCEID_FIELD.fieldApiName] = event.target.dataset.recordId;
        if(event.target.name === "UpLike"){
            fields[VOTE_VOTECHECKBOX_FIELD.fieldApiName] = true;
        }else{
            fields[VOTE_VOTECHECKBOX_FIELD.fieldApiName] = false;
        }
        fields[USER.fieldApiName] =this.userId;
        
        const recordInput = {
            apiName: VOTE_OBJECT.objectApiName,
            fields: fields
        };
        createRecord(recordInput)
        .then(result => {console.log(result)})
        this.getData();
        if(this.searchPostValue!== ''){
            this.postSearchKeyword(event);
        }
    }
    else{
    const updatefields ={};

    const recordInput = {
        fields: updatefields
        };
        updatefields[VOTE_ID_FIELD.fieldApiName]= this.postRecord[recindex].voterec.Id;
    if(this.postRecord[recindex].voterec.Vote__c == true){
        updatefields[VOTE_VOTECHECKBOX_FIELD.fieldApiName] = false;
    } else{
        updatefields[VOTE_VOTECHECKBOX_FIELD.fieldApiName] = true;
    }
    updateRecord(recordInput)
    .then((data) => console.log(data))
    .catch((error) => console.log(error));
    }
}

onclickViewComments(event){
    let postRecordId = event.target.dataset.recordId;
    let recindex = event.currentTarget.dataset.index;
    let postRecordName;  

    postRecordName = this.postRecord[recindex].postRec.Name;

    console.log('postRecordName : '+postRecordName);
    console.log('postRecordId : '+postRecordId);

        this[NavigationMixin.Navigate]({
            type: "standard__component",
            attributes: {
                componentName: "c__navigateToComments"
            },
            state: {
                c__postid: postRecordId,
                c__postName: postRecordName
            }
        });
    }


    handleToggleSection() {
        if(this.accordianSection.length === 0){
          this.accordianSection =''
      }
      else{
          this.accordianSection ='comment'
      }

  }

}