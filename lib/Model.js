var inherits = require('inherits');

function Model(){}

var undef = function(val){
  return typeof val === 'undefined' || val === null;
};

var falsey = function(val){
  switch(typeof val){
    case 'string':
      return val !== 'false' && val !== '';
    default:
      return !!val;
  }
};

var setProperties = function(schema,model,defaults){
  Object.keys(schema || {}).forEach(function(name){
    var property = schema[name];
    if(typeof property === 'function' || typeof property === 'string'){
      var obj = {};
      switch (property){
        case Boolean:
        case String:
        case Number:
        case 'Any':
          obj.type = property;
      }
      property = obj;
    }
    if(typeof property !== 'object'){
      throw new Error('Tried to initialize a property with an invalid value : ' + (model && model.constructor.prototype.name) + '.' + name);
    }
    if(property.type){
      var getter = function(){
        if(property.get){
          return property.get.call(this);
        } else {
          return defaults[name];
        }
      };
      var setter = function(val){
        if(!undef(val) && property.type !== 'Any' && val.constructor !== property.type){
          switch(property.type){
            case Boolean:
              val = falsey(val);
              break;
            case Number:
              val = parseFloat(val,10);
              break;
            case String:
              val = val.toString();
              break;
          }
        }
        if(property.set){
          property.set.call(this,val);
        } else {
          defaults[name] = val;
        }
      };

      Object.defineProperty(model,name,{
        get : getter,
        set : setter,
        enumerable : true,
        configurable : true
      });
      // define the default value if it exists
      if(defaults[name]){
        model[name] = defaults[name];
      }
    } else {
      model[name] = setProperties(schema[name],model[name],defaults[name]);
    }
  });
  return model;
};

var toObject = function(){
  var model = this;
  var object = Object.keys(model).reduce(function(o,key){
    var val = model[key];
    if(typeof val !== 'undefined' && val !== ''){
      o[key] = (typeof val === 'function') ? val() : val;
    }
    return o;
  },{});
  return object;
};

module.exports = function(name,schema,collection){
  if(typeof name !== 'string') throw new Error('You must provide a name when creating a new model.');
  if(typeof schema !== 'object') throw new Error('You must provide a schema object when creating a new model.');
  if(typeof collection !== 'string') throw new Error('You must provide a collection name when creating a new model.');
  var SubModel = function(object){
    var sub = Model.call(this);
    var values = object || {};
    setProperties(schema,this,values);
    return sub;
  };
  inherits(SubModel, Model);
  SubModel.prototype.schema = schema;
  SubModel.prototype.collection = collection;
  SubModel.prototype.toObject = toObject;
  SubModel.subclass = function(){
    var SubClass = function(){
      return SubModel.call(this);
    };
    inherits(SubClass,SubModel);
    return SubClass;
  };
  return SubModel;
};
