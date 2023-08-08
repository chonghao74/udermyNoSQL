const express = require("express");//use express
const mongoose = require('mongoose');//use mongoose
const app = express();
const { Schema } = mongoose;//make schema

app.use(express.static("public"));// 設定 css 路由為 public
app.set("view engine", "ejs");//設定後，若 render EJS file 就不用副檔名

//mongoose connect
mongoose.connect('mongodb://127.0.0.1:27017/school').then(() => {
    console.log("連結 MongoDB Success");
}).catch((e) => {
    console.log(`連結 MongoDB Fail ${e}`);
});


//define a schema
const studentSchema = new Schema({
    name: String,
    age: {
        type: Number,
        min: [12, 'Too young'],
        max: [150, 'Too old'],
        required: [true, 'Why no age?']
    },
    major: { type: String },
    classtimetable: [String],
    basic: {
        h: {
            type: Number,
            min: [30, 'Error H'],
            max: 300
        }, w: Number, g: {
            type: String,
            enum: ['M', 'F']
        }
    }
});

//define schema instance methoed
studentSchema.methods.calBmi = function () {
    console.log(this);
    console.log(this.basic.w);
    console.log(this.basic.h);
    const bmi = ((this.basic.w) / (Math.pow((this.basic.h / 100), 2))).toFixed(2);
    return bmi;
}

studentSchema.methods.changeAge = function () {
    let calAge = this.age;
    if (calAge >= 100) {
        this.age = calAge - 100;
    }
    else {
        this.age++;
    }

    this.save();
}

//define a static Method
studentSchema.statics.testStatic = function () {
    return this.updateMany({ __v: 1 }, { __v: 0 });
}


//create a Model for Student
const Student = mongoose.model("Student", studentSchema);
//insert data
//e.g.1 by query
// const newStudent = new Student({
//     name: "Error",
//     age: 49,
//     major: "Bussiness",
//     classtimetable: ["A", "B", "C", "D", "E"],
//     basic: { h: 300, w: 65, g: "M" }
// });

// newStudent.save()
//     .then(data => {
//         console.log("Success Insert DB");
//         console.log(data)
//     })
//     .catch(e => {
//         console.log(e);
//     });

//e.g.2
// const Person = mongoose.model("Person", studentSchema);
// const newPerson = new Person({
//     name: "Hb",
//     age: 20,
//     major: "Bussiness",
//     classtimetable: ["A", "B", "C", "D", "E"],
//     basic: { h: 170, w: 65, g: "F" }
// });

// newPerson.save()
//     .then(data => {
//         console.log("Success Insert DB");
//         console.log(data)
//     })
//     .catch(e => {
//         console.log(e);
//     });

async function findPerson() {
    try {
        let data = await Person.find({}).limit().exec();

    }
    catch (e) {
        console.log(e);
    }

    // Person.find({}).limit(3).exec()
    // .then(data => {
    //     console.log(data);
    // })

}



app.get("/home", (req, res) => {
    const students = mongoose.model("students", studentSchema);
    //const students = mongoose.model("student", { name: String, age: Number });

    //Update
    // students.updateOne({ age: { $eq: 13 } }, { age: 12 })
    //     .then(data => {
    //         console.log(data);
    //     })
    //     .catch(e => {
    //         console.log(e);
    //     });

    // students.updateMany({ age: { $eq: 12 } }, { age: 13 })
    //     .then(data => {
    //         console.log(data);
    //     })
    //     .catch(e => {
    //         console.log(e);
    //     });

    // students.findOneAndUpdate({ age: { $eq: 12 } }, { age: 13 }, { new: true })
    //     .then(data => {
    //         console.log(data);
    //     })
    //     .catch(e => {
    //         console.log(e);
    //     });

    // students.findOneAndUpdate({ age: { $eq: 49 } }, { age: 200 }, { new: true, runValidators: true })
    //     .then(data => {
    //         console.log(data);
    //     })
    //     .catch(e => {
    //         console.log(e);
    //     });

    //利用 find/findOne + Schema instance Method + document.save() 更新資料 
    // students.find({ age: { $gte: 0 } }).then(data => {
    //     data.forEach(o => {
    //         o.changeAge()
    //     });
    //     console.log(data);
    // })
    //     .catch(e => {
    //         console.log(e);
    //     });

    //利用 Schema static + Model updateMany 更新資料
    students.testStatic().then(data => {
        console.log(data);
    })
        .catch(e => {
            console.log(e);
        });

    //Read
    // students.findOne({ age: { $eq: 13 } })
    //     .then(data => {
    //         console.log(data);
    //     })
    //     .catch(e => {
    //         console.log(e);
    //     });

    // students.find({ age: { $eq: 13 } }).then(data => {
    //     console.log(data);
    // }).catch(e => {
    //     console.log(e);
    // });

    //use schema instance method
    // students.find({ age: { $gte: 10 } }).then(data => {
    //     data.forEach(o => {
    //         console.log(o.calBmi());
    //     })
    // })
    //     .catch(e => {
    //         console.log(e);
    //     })

    //Delete
    // students.deleteOne({ age: { $eq: 50 } }).then(data => {
    //     console.log(data);
    // }).catch(e => {
    //     console.log(e);
    // });

    // students.findOneAndDelete({ name: { $eq: 'Error' } }).then(data => {
    //     console.log(data);
    // }).catch(e => {
    //     console.log(e);
    // });

    // students.deleteMany({ age: { $gte: 50 }, name: 'Error' }).then(data => {
    //     console.log(data);
    // }).catch(e => {
    //     console.log(e);
    // });

    res.status(200).render("home");
});

app.get("*", (req, res) => {
    res.send("Error");
});


app.listen(3000, () => {
    console.log("listtening port 3000");
})