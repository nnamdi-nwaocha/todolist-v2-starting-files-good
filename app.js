//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
 
const mongoose = require('mongoose')
const app = express();
const _ = require('lodash')

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect('mongodb+srv://nnamdinwaocha:Ms5qiPPG6e1KsvdF@cluster0.4pgnimr.mongodb.net/todoListDB'
)
const itemsSchema = {
  name: String
}
const Item = mongoose.model("Item", itemsSchema)
let item1 = new Item({
  name: 'Welcome to your todolist'
})
let item2 = new Item({
  name: 'Hit the + button to add a new item'
})
let item3 = new Item({
  name: '<-- Hit this to delete an item'
})
const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);




app.get("/", function(req, res) {
  Item.find({}).then(foundItems => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems);
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle: 'Today', newListItems: foundItems});
    }
  })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  }) 
  // console.log(itemName);
  // console.log(listName);
  async function findAndAdd(){
    const foundList = await List.findOne({ name: listName });
    if (listName === 'Today'){
      item.save()
      res.redirect('/');
    }else {
        foundList.items.push(item);
        foundList.save();
        res.redirect('/' + listName);
    }
  }
  findAndAdd();
});
app.post('/delete', function(req,res) {
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName

  if (listName === 'Today'){
    async function deleteItem() {
      await Item.deleteOne({ _id: checkedItemId });
    }
    deleteItem();
    res.redirect('/');
  }else {
    // async function deleteCustomItem() {
    //   // await List.findByIdAndDelete(checkedItemId);
    //   const foundList = await Item.findById(checkedItemId);
    //   console.log(checkedItemId);
    //   console.log(foundList);
    // }
    // deleteCustomItem();
    // res.redirect('/' + listName);




    async function pulling(nameOfList, itemId) {
      const result = await List.findOneAndUpdate(
          { name: nameOfList },
          { $pull: { items: { _id: itemId } } });
      // console.log('item removed:', result);
    }
    
    pulling(listName , checkedItemId);
    
    res.redirect('/' + listName);
  }

})

app.get('/:paramName', function(req, res) {
  const customListName = _.capitalize(req.params.paramName);
  async function findListName(){
    const searchListName = await List.findOne({ name: customListName });


    if (customListName === searchListName?.name){
      // Show an existing list
      // console.log('exists')
      res.render('list', {listTitle: customListName, newListItems: searchListName.items})

    } else {
      if (customListName === 'favicon.ico') {
        // console.log('this is the home page')
      }else {
        // console.log('this page does not exist')
        //create a new list
        const list = new List ({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.render('list', {listTitle: list.name, newListItems: list.items})
      }
      // console.log(customListName)
    };

  }
  findListName();
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
