/* eslint-disable */
import * as THREE from 'three'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'

const loader = new OBJLoader();

// load a resource
loader.load(
	// resource URL
	'models/monster.obj',
	// called when resource is loaded
	function ( object ) {
		//do something

	},
	// called when loading is in progresses
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);