# An extremely brief history of modules and loaders

Throughout the JavaScript ages, modules have been stored one a files. While it has long been considered good practice to have one module per file, CommonJS made that a must. ES6 also specifies that there is exactly one module per file and one file per module.

1. In the beginning, there were script tags
   ```<script src="framework.js"></script>
<script src="plugin.framework.js"></script>
<script src="myplugin.framework.js"></script>
<script src="init.js"></script>```
2. Procedurally oriented scripts like LabJS (http://labjs.com/documentation.php)
   ```<script>
   $LAB
   .script("framework.js").wait()
   .script("plugin.framework.js")
   .script("myplugin.framework.js").wait()
   .script("init.js").wait();
</script>```
3. RequireJS / AMD
   ```
   <script src="scripts/require.js"></script>
   <script>
  require(['framework'], function() {
      // Configuration loaded now, safe to do other require calls
      // that depend on that config.
      require(['myplugin'], function(foo) {

      });
  });

  define(["./cart", "./inventory"], function(cart, inventory) {
          //return an object to define the "my/shirt" module.
          return {
              color: "blue",
              size: "large",
              addToCart: function() {
                  inventory.decrement(this);
                  cart.add(this);
              }
          }
      }
  );
  </script>
  ```
4. Node / Browserify / CommonJS
   ```
   require('framework')
   module.exports = require('myplugin')
   ```
5. Webpack / CommonJS++
  ```
  require('raw!./framework.js')
  module.exports = require('-!raw!./script.coffee')
  ```
6. Static import + export / CommonJS--
  ```
  import 'framework'
  import myplugin from 'myplugin'
  export default myplugin
  ```
  http://www.2ality.com/2014/09/es6-modules-final.html

7. SystemJS?
   ```
   <script type="module">
  // loads the 'q' export from 'mymodule.js' in the same path as the page
  import { q } from 'mymodule';

  new q(); // -> 'this is an es6 class!'
  </script>

  <script>
  System.import('some-module').then(function(m) {
    console.log(m.p);
  });
  </script>
   ```
   http://www.2ality.com/2014/09/es6-modules-final.html
