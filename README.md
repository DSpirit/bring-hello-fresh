# Bring NPM x Hello Fresh

This Azure Function running on node.js v12 adds any given [Hello Fresh](hellofresh.de) to your [bring](https://www.getbring.com/) shopping list.

# How-To
1. Change your credentials / set them properly via environment variables.
2. Call your function with the url query parameter
3. GET https://<name-of-your-function>.azurewebsites.net/api/AddRecipeToBring?code=<your-func-key>&url=<full-hello-freshrecipe-url>