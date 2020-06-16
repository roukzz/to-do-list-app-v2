//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{ useUnifiedTopology: true, useNewUrlParser: true });
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

app.post("/", function(req, res){

  const item = new Item({name:req.body.newItem}) ;
  item.save();
  res.redirect("/");

});


app.post("/delete",function(req,res){
  const itemId = req.body.checkbox
  Item.findByIdAndRemove(itemId,function(err){
      if (err){
        console.log(err);
      }else{
        console.log("successfuly deleted item from ItemsDB");

      }
  });
  res.redirect("/");
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
    console.log("Hello World !!!");
});
