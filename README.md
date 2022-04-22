### Loop Assisgnment
The challenge is simple: Let's create a small one-page demo page. We provide you with a PSD and a JSON file and you return a static HTML template.

Please note that we're aware it’s a very simplistic design and it’s missing some important things like e.g. responsive states. The idea is to see how a front end developer can deal with that and fill the gaps.

Some hints:
- If you are familiar with these tools, use a setup of webpack, SASS and plugins you like/need.
- If you think you need a framework, feel free to use one (we would actually prefer seeing how you can handle it without).
- For mobile the menu should turn into the well-known burger style menu.
- The desktop’s version max-width is 1400px. It should not scale to 100% screen width. You can set the main background color to #e5eaee.
- The crew members should be loaded async via the API, also the filtering should be handled with AJAX requests (further infos for the API after the hints)
- Only load 5 crew members at a time, use the "Load more" button to load the next bunch
- The filter above the crew members should basically filter down the list of members (the different duties are also coming via the API)
- The facts shown for the crew member images when hovering over it should slide to the right box next to each picture. Except for the ones on the right side for sure. E.g. the facts for the top left photo are displayed in the box right next to it. The other photo is hidden in the meantime.
- There is an overlay included in the design. This can be added for showing details on news.
- Don't overdue animations, but add some nice hovers and transitions where they make sense.
- Don't focus on content it's just a demo.
- This demo is just fictional and not a real world project. We won't publish your code nor use it anywhere else.
- We don't want you to spend days on this. If you have serious problems with it, let us know.
- We are really aware the design is not state of the art.
- The URL for the API is https://challenge-api.view.agentur-loop.com/api.ph...

Some things to mention:
- Use the GET method to fetch the data​
- The API accepts three different parameters - page (int), limit (int) and duty (string - following options: tactic, trim, helmsman)
- It uses a default pagination, so with page and limit you can navigate through the team members, e.g. page=2 and limit=7 would return member 8 to 14​
- With the duty parameter you can filter to only get crew members with this duty​​

#### How to install and run the project
The project is initiziated using npm. To run this project in development mode you will require following softwares:
1. NODE : It is a Javascript engine which helps execute Javascript code outside of a web browser.
2. NPM : Mostly comes with node installer, is a package manager for Javascript. It pairs nicely with module bundler Webpack.

##### Commands to start dev server
Step 1. Run command to first install all package dependencies
```npm install```

Step 2. Run command to start development server
```npm run serve```

Step 3. Server gets created in port 3000 and it automatically serves the project url http://localhost:3000 in browser.

##### Commands to build for production
Step 1. Run command to first install all package dependencies
```npm install```

Step 2. Run command to build files
```npm run build```

Step 3. All build files are generated inside a ./dist folder. The files can be served using any live server or you can directly open ./dist/index.html file in a browser. \*Note: the dist build files are already included in this codebase.