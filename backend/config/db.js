import mongoose from "mongoose";

const connectionDB = async() =>{
try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log('mongoose connected');

}catch(e){
    console.error("MongoDB connection failed:", e.message);
}
};

export default connectionDB;