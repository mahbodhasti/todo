// jshint esversion:6

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const port = 8080;
const mongoose = require("mongoose");
const { name } = require("ejs");
const _ =require("lodash")

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
// "mongodb://localhost:27017/todolistDB"
mongoose.connect("mongodb+srv://admin-mahbod:7363556m@cluster0.aikds.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Successfully connected to the database.");
    })
    .catch((err) => {
        console.error("Connection error", err);
    });
const ItemsSchema = {
	name:String,	
}
const listSchema = new mongoose.Schema({
    name: String,
    items: [ItemsSchema] // Correct reference to itemsSchema
});

const Item = mongoose.model("item",ItemsSchema)
const List = mongoose.model("list",listSchema)

var items = ["Item 01", "Item 02", "Item 03"];
var workItems = [];

const item1 = new Item({
	name:"welcome to your todo list"
})
const item2 = new Item({
	name:"hit the + buutton to add a new item "
})
const item3 = new Item({
	name:"<-- hit this to delete an item"
})

const defaultItem =[item1,item2,item3]

	var today = new Date();
	var options = {
		weekday: "long",
		month: "long",
		day: "numeric"
	};

	var day = today.toLocaleDateString("en-US", options);


app.get("/", async (req, res) => {
    try {
        const today = new Date();
        const options = {
            weekday: "long",
            month: "long",
            day: "numeric",
        };

        const day = today.toLocaleDateString("en-US", options);

        const foundItems = await Item.find({}); // Assuming 'Item' is your Mongoose model

        if (foundItems.length === 0) {
            // If no items found, insert default items (assuming 'defaultItem' is defined)
            await Item.insertMany(defaultItem);
            console.log("Successfully inserted default items.");
            res.redirect("/" ); // Redirect to the specified title
        } else {
            
            res.render("list", { listTitle: "today",day:day, newListItems: foundItems });
        }
    } catch (error) {
        console.error("Error handling GET request:", error);
        res.status(500).send("Something went wrong!"); // Handle the error gracefully
    }
});

// app.post("/", (req, res) => {

//     const today = new Date();
//     const options = {
//         weekday: "long",
//         month: "long",
//         day: "numeric",
//     };

//     const day = today.toLocaleDateString("en-US", options);

// 	var item = req.body.newItem;
// 	const listName = req.body.list
// 	// if (req.body.list === "Work") {
// 		const item1 = new Item({
// 			name : item
// 		})
//         if(listName=== day){
//             item.save()
// 		    res.redirect("/");
//         }else{
//             List.findOne({name:listName}).then((foundList)=>{
//                 foundList.item1.push(item);
//                 foundList.save()
//                 res.redirect("/" + listName)
//             })
//             .catch((err)=>{console.log(err)})
//         }
app.post("/", (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    const item = new Item({ name: itemName });
    console.log(item)
    const today = new Date();
    const options = { weekday: "long", month: "long", day: "numeric" };
    const day = today.toLocaleDateString("en-US", options);

    if (listName === "today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }).then((foundList) => {
           
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        }).catch(err => console.log(err));
    }
});
	
		


app.post("/delete",(req,res)=>{
	const chekedId =  req.body.checkbox
    const listName =req.body.Listname
    if (listName==="today"){
        Item.findOneAndDelete(chekedId).then(
            ()=>{
                console.log("delete success")
                res.redirect("/")
            }
        ).catch((err)=>{
            console.log("delete failed")
        })
    }else{
        List.findOneAndUpdate({ name:listName},{$pull:{items:{_id:chekedId}}}).then((foundList)=>{
            res.redirect("/" + listName)
        }).catch((err)=>{
           console.log(err)
        })
    }

})




app.get("/:customList", async (req, res) => {
    const customListName = _.capitalize(req.params.customList);

    try {
        // Check if the list already exists
        const foundList = await List.findOne({ name: customListName });

        if (!foundList) {
            console.log("Doesn't exist. Creating a new list.");

            // If the list does not exist, create it
            const list = new List({
                name: customListName,
                items: ItemsSchema // Assuming defaultItems is defined
            });

            await list.save(); // Save the new list
            console.log("New list created and saved.");

            res.render("list", { listTitle: customListName,day:day , newListItems: list.items });
        } else {
            console.log("Exists. Already created.");

            // If the list exists, render the existing list
            res.render("list", { listTitle: foundList.name,day:day ,newListItems: foundList.items });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while accessing the list.");
    }
});

app.get("/about", (req, res) => {
	res.render("about");
});
app.get('/moon/home',(req,res)=>{
    res.render("moon.ejs")
})

app.listen(port, () => {
	console.log(`Listening on port ${port}...`);
});

