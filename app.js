//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-farouk:Test123@cluster0-xult5.mongodb.net/todolistDB",{ useUnifiedTopology: true, useNewUrlParser: true });
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemsSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  }
});

const Item = mongoose.model("Item",itemsSchema);

const task1 = new Item({name: "welcome to your to do list"});
const task2 = new Item({name: "press on the + button to add a new task"});
const task3 = new Item({name: "hit the check box to delete a task"});

const defaultItems =[task1,task2,task3];

const listSchema = {
  name: String,
  items:[itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

const day = date.getDate();

// add the default task
Item.find(function(err,foundItems){

  if (foundItems.length === 0){

    Item.insertMany(defaultItems,function(err){
      if (err){
        console.log(err);
      }else{
        console.log("successfuly added the default taks")
      }
    });
  }

   if (err){
    console.log(err);
  }else{
    res.render("list", {listTitle: day, newListItems: foundItems});
  }
  });
});


app.get("/:list",function(req,res){
  const listName = _.capitalize(req.params.list);

List.findOne({name:listName},function(err,list){

    if(err){
      console.log(err);
    }else{

      if (list != null){
          res.render("list", {listTitle: list.name, newListItems: list.items});
      } else{

        const list = new List({
        name: listName,
        items:defaultItems
        });

        list.save();
        res.redirect("/"+listName);
      }

    }
});





});

app.post("/", function(req, res){

  const item = new Item({name:req.body.newItem}) ;
  const listName = req.body.list;

  console.log("list Name: "+listName);

  if (listName === date.getDate()){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name:listName},function(err,foundList){
      if(err){
        console.log(err);
      } else{
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      }
    });
  }


});


app.post("/delete",function(req,res){
  const itemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName ===date.getDate()){
    Item.findByIdAndRemove(itemId,function(err){
        if (err){
          console.log(err);
        }else{
          console.log("successfuly deleted item from ItemsDB");

        }
    });
    res.redirect("/");
  } else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemId}}},function(err,foudList){
      if(!err){
        res.redirect("/"+listName);
      }else{
        console.log(err);
      }
    });
  }

});



app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port, function() {
  console.log("Server started successfuly");
});
