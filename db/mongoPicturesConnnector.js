import { debug } from "console";
import { MongoClient, ObjectId } from "mongodb";
import * as dotenv from 'dotenv';
dotenv.config();

function mongoPictureConnector({
  dbName = "hiking-stories",
  collection_name = "user-pictures",
  defaultUri = "mongodb://localhost:27017",
} = {}) {
  const me = {};
  me.debug = false;
  const URI = process.env.MONGODB_URI || defaultUri;
  //console.log("DEBUG URI",URI); //chec
  const connect = () => {
    const client = new MongoClient(URI);
    const posts = client.db(dbName).collection(collection_name);
    return { client, posts };
  };


  me.addPicture = async (pictureData) => {
    console.log("++Adding Picture to",URI);
    const { client, posts } = connect();
    try {
      console.log(pictureData);
      await posts.insertOne(pictureData);
      return;
    } catch (err){
      console.error("Error fetching posts from MongoDB", err);
      throw err;
    } finally {
      await client.close();
    }
  }


  /* These are lable percent1 and 2 because we don't controll which is which. We just take the larger.
  This returns all the data we need for the new post*/
  me.getPicturesForPosts = async (userID,percent1,percent2) => {
    // percent1 = 0;
    percent2 = parseFloat(percent2);
    percent1 = parseFloat(percent1);
    if (percent1 >= percent2){  /* use Math.floor and Math.ceil for percent bouding could be better, but it still works */
      percent1++, percent2--;
    } else {
      percent2++, percent1--;
    }
    console.log(percent1,percent2);
    const query = (percent1 <= percent2) ? {$and:[{"percent":{$gte:parseInt(percent1)}},{"percent":{$lte:parseInt(percent2)}},{"user":userID}]}
            : {$and:[{"percent":{$gte:parseInt(percent2)}},{"percent":{$lte:parseInt(percent1)}},{"user":userID}]};

    console.log(query)
    const { client, posts } = connect();
    try {
      const data = await posts
        .find(query)
        .toArray();
      return data;
    } catch (err) {
      console.error("Error fetching posts from MongoDB", err);
      throw err;
    } finally {
      await client.close();
    }
  }

  return me; 
}

export default mongoPictureConnector();
