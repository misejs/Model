var assert = require('assert');
var Model = require('../../lib/Model');

describe('Model',function(){

  it('should subclass Model when creating a new one',function(){
    var Thing = new Model('Thing',{},'things');
    Object.keys(Thing.prototype).forEach(function(prop){
      assert.ok(Thing.prototype[prop]);
    });
  });

  it('should inherit properties from Model',function(){
    var Thing = new Model('Thing',{},'things');
    assert.deepEqual(Thing.prototype.schema, {});
    assert.strictEqual(Thing.prototype.collection, 'things');
    assert.equal(typeof Thing.prototype.toObject, 'function');
    assert.equal(typeof Thing.subclass, 'function');
  });

  it('should allow subclassing of created models',function(){
    var Thing = new Model('Thing',{},'things');
    var NewModel = Thing.subclass();
    NewModel.prototype.instance = function(){
      return this;
    };
    NewModel.class = function(){
      return NewModel;
    };
    assert.notDeepEqual(Thing,NewModel);
    assert.equal(NewModel.class(),NewModel);

    var instance = new NewModel();
    assert.equal(instance.instance(),instance);

    assert.ok(!Thing.class);
    var thing = new Thing();
    assert.ok(!thing.instance);
  });

  it('should add getters and setters for properties',function(){
    var Thing = new Model('Thing',{
      property : {
        type : String
      }
    },'things');
    var thing = new Thing({property : 'foo'});
    var descriptor = Object.getOwnPropertyDescriptor(thing,'property');
    assert.ok(descriptor.get);
    assert.ok(descriptor.set);
    assert.strictEqual(thing.property,'foo');
  });

  it('should sanitize typed properties',function(){
    var Thing = new Model('Thing',{
      str : {
        type : String
      },
      num : {
        type : Number
      },
      bool : {
        type : Boolean
      },
      whatever : {
        type : 'Any'
      }
    },'things');

    var thing = new Thing({
      str : 1,
      num : '8',
      bool : 'YES',
      whatever : { whatever : 'dude' }
    });

    assert.strictEqual(thing.str,'1');
    assert.strictEqual(thing.num,8);
    assert.strictEqual(thing.bool,true);
    assert.strictEqual(thing.whatever.whatever,'dude');
  });


  it('should allow setting property types if directly passed',function(){
    var Thing = new Model('Thing',{
      str : String,
      num : Number,
      bool : Boolean,
      whatever : 'Any'
    },'things');

    var thing = new Thing({
      str : 1,
      num : '8',
      bool : 'YES',
      whatever : { whatever : 'dude' }
    });

    assert.strictEqual(thing.str,'1');
    assert.strictEqual(thing.num,8);
    assert.strictEqual(thing.bool,true);
    assert.strictEqual(thing.whatever.whatever,'dude');
  });

  it('should not allow setting property types that don\'t exist',function(){
    assert.throws(function(){
      new Thing('Thing',{crap : 'Fake'},'things');
    },'Tried to initialize a property with an invalid value : Thing.crap');
  });

  it('should not allow construction without the required parameters',function(){
    assert.throws(function(){
      new Model();
    },Error);
    assert.throws(function(){
      new Model('I\'m','confused');
    },Error);
    assert.throws(function(){
      new Model('Forgot',{'my':'collection'});
    },Error);
  });

  it('should serialize to an object when .toObject() is called',function(){
    var Thing = new Model('Thing',{
      str : String,
      num : Number,
      bool : Boolean,
      whatever : 'Any'
    },'things');

    var thing = new Thing({
      str : 1,
      num : '8',
      bool : 'YES',
      whatever : { whatever : 'dude' }
    });

    assert.deepEqual(thing.toObject(),{
      str : '1',
      num : 8,
      bool : true,
      whatever : { whatever : 'dude' }
    });
  });

});
