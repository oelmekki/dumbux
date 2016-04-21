"use strict";

class DataManager {
  constructor( props, parent ){
    this.props = props || {}
    this.parent = parent;

    if ( this.parent ){
      this.root = this.parent;
      while ( this.root.parent ) this.root = this.root.parent;
    }

    this.initializeSubManagers();
    this.initializeData();
  }

  initializeSubManagers(){
    if ( ! this._submanagers ){
      this._submanagers = ( () => {
        if ( this.hasSubmanagers() ){
          let managers = {};
          Object.keys( this.getSubManagers() ).forEach( ( key ) => {
            let managerClass = this.getSubManagers()[ key ];
            managers[ key ] = new managerClass( this.props[ key ], this );
            managers[ key ].subscribe( this._changed.bind( this ) );
            this[ key ] = managers[ key ];
          });

          return managers;
        }

        else return {};
      })();
    }
  }

  initializeData(){ return this.state = this.mergeInitial( this.getInitialState() ); }

  callbacks(){
    if ( ! this._callbacks ) this._callbacks = [];
    return this._callbacks;
  }

  getInitialState(){ return {} }

  subscribe( callback ){ this.callbacks().push( callback ); }
  unsubscribe( callback ){ this._callbacks = this._callbacks.filter( ( cb ) => cb !== callback ) }

  hasSubmanagers(){
    return this.getSubManagers && Object.keys( this.getSubManagers() ).length > 0;
  }

  mergeInitial( data ){
    Object.keys( this._submanagers ).forEach( ( key) => {
      data[ key ] = this._submanagers[ key ].initializeData();
    });

    return data;
  }

  getState(){
    let state = {};
    Object.keys( this.state ).forEach( ( key ) => {
      state[ key ] = this.state[ key ];
    });

    Object.keys( this._submanagers ).forEach( ( key ) => {
      state[ key ] = this._submanagers[ key ].getState();
    });

    return state;
  }

  setState( data, propagate ){
    if ( typeof propagate === 'undefined' ) propagate = true;

    Object.keys( data ).forEach( ( key ) => {
      if ( this._submanagers[ key ] ) this._submanagers[ key ].setState( data[ key ], false );
      else this.state[ key ] = data[ key ];
    });

    if ( propagate ) this._changed();
  }

  _changed(){ this.callbacks().forEach( ( callback ) => callback( this.getState() ) ); }

  resetData(){
    Object.keys( this._submanagers ).forEach( ( name ) => {
      this._submanagers[ name ].resetData();
    });

    this.initializeData();
  }
}

DataManager.rememberedStates = 100;

DataManager.createClass = function( properties ){
  let klass = function( props, parent ){
    this.props = props; this.parent = parent;
    if ( ! this.props ) this.props = {};

    Object.keys( properties ).forEach( ( name ) => {
      let property = properties[ name ];
      if ( typeof property === 'function' ) this[ name ] = property.bind( this );
      else this[ name ] = property;
    });

    DataManager.call( this, props, parent );
    return this;
  }

  klass.prototype = DataManager.prototype;
  return klass;
};

if ( typeof module !== 'undefined' && module[ 'exports' ] ){
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports['default'] = DataManager;
}

else if ( typeof this !== 'undefined' ){
  this['DataManager'] = DataManager;
}
