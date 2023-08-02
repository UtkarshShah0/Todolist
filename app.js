require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));



//Setting up mongoose connection
mongoose.connect(process.env.uri, 
                  {useUnifiedTopology : true},
                  {useNewUrlParser: true})

const itemSchema = new mongoose.Schema({name: String})

const Item = mongoose.model("Item", itemSchema)



//Data
const item_1 = new Item({
  name: "DSA"
})

const item_2 = new Item({
  name: "DEV"
})

const item_3 = new Item({
  name: "Open Source"
})

const defaultItems = [item_1, item_2, item_3] 
// Item.insertMany(defaultItems)



//Custom List
const customListSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
}) 


const List = mongoose.model("List", customListSchema)



//get and post requests
app.get("/", function(req, res) {

  Find()
  async function Find(){
    const foundItems = await Item.find({})
    
    if (foundItems.length === 0){
      console.log("Hello")
      Item.insertMany(defaultItems)
    } else{
      console.log(foundItems)
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  }
})



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list


  const item = new Item({
    name: itemName
  })

  
  if( listName === "Today"){
    item.save()
    res.redirect("/")

  }else{

    Find()
    async function Find(){
      const foundList =  await List.findOne({name: listName})
      foundList.items.push(item)
      foundList.save()
      res.redirect("/"+ listName)
    }

  }

});


app.post("/delete", function(req, res){

  const checkedItemId = req.body.checkbox
  const listName = req.body.listName

  console.log(checkedItemId)

  if( listName === "Today"){
    Delete()
    async function Delete(){
      await Item.deleteOne({_id: checkedItemId})
    }
    res.redirect("/")

  }else{

    Delete()
    async function Delete()
    {
      await List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}})
      res.redirect("/"+ listName)
    }
  }
  

}) 



app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName)
  

  Find()
  async function Find(){
    const foundList =  await List.findOne({name: customListName})


    if( !foundList){
      // Create a new list

      const list = new List({
        name: customListName,
        items: defaultItems
      })
      list.save()

      res.redirect("/"+ customListName)
      console.log("Doesn't exist")
    }
    else{

      // show existing list
      console.log("Exist")
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items })
    }
  
  }
  // res.render("list", {listTitle: customListName, newListItems: foundItems})
})



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
