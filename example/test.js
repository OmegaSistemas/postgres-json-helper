const Product = require("./Product");

Product.sync().then(() => {
    /**
     * Properties that were not passed in the "content" will be added with the default value. 
     **/
    Product.create({
        content: {
            name: "My nice product",
            date: new Date(),
            balance: 20,
            data: Schema.obj({
                manufacturer: "",
                name: "",
                especify: Schema.obj({
                    version: "0.0.1",
                }),
            }),
        },
    }).then(res => {
        console.log(res);
    }).catch(err => {
        console.error(err);
    });
});