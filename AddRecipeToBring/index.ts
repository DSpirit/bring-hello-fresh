import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios  from "axios";
import bringApi from "bring-shopping"
import { JSDOM } from "jsdom"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    // make sure to replace <user> and <pw> with your credentials
    // you can change your credentials online https://www.getbring.com/
    const bring = new bringApi({mail: '<user>@<mail>.com', password: '<pw>'});

    // login to get your uuid and Bearer token
      try {
        await bring.login();
        context.log(`Successfully logged in as ${bring.name}`);
    } catch (e) {
        context.log(`Error on Login: ${e.message}`);
    }

    // hello fresh url to extract recipe from (e.g. https://www.hellofresh.de/recipes/veganes-maronen-pilz-ragout-60101ee68cf3fb769543ace2)
    const url = req.query["url"];

    // get all lists and their listUuid
    const lists = await bring.loadLists();
    const listId = lists.lists[0].listUuid;
    const listName = lists.lists[0].name;

    const ingredients = [];
    await axios.get(url).then(response => {
        const dom = new JSDOM(response.data);

        dom.window.document.querySelectorAll('div[data-test-id="ingredient-item-shipped"]').forEach((el) => {
            var item = ""
            var specification = ""
            var description = el.querySelectorAll('p');
            item = description[1].textContent.trim();
            if (description.length > 2)
            {
                specification = description[0].textContent.trim() + " " + description[2].textContent.trim()
            }
            else if (description.length > 1)
            {
                specification = description[0].textContent.trim()
            }

            context.log("Adding element: " + item + " to list " + listName);
            ingredients.push(item.trim());
            bring.saveItem(listId, item, specification)
        });

        context.log(ingredients);
    });

    ingredients.forEach((item) => {
        context.log("Adding element: " + item);
        bring.saveItem(lists[0], item, item)
    });

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: ingredients
    };
};

export default httpTrigger;