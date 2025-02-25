import mongoose from'mongoose' ;

const ProductSchema =new mongoose.Schema({
    name:{type:String , required:true},
    description :{type:String},
    price :{type:Number ,required:true},
    discount :{type:Number ,default:0},
    category :{type:mongoose.Schema.Types.ObjectId,ref:'category'},
    thumbnail:{type:String},
    stock:{type:Number, default:0},
    images:[{type:String}],
    isActive:{type:Boolean,default:true}},{timestamps:true});
    
    ProductSchema.virtual('finalPrice').get(function(){
        return this.price -(this.price*(this.discount/100));
    });
    
    export default mongoose.model('product',ProductSchema);


