//IMPORTAR LOS ARCHIVOS
import React, { useEffect, useState } from 'react';
//Modal para la pantalla emergente, textinput para la entrada de datos, touchable para nuestros botones
import { View, Text, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity,Modal} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AntDesign} from '@expo/vector-icons';//Iconos
//Firebase importacion
import app from './firebaseconfig';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import {getDatabase} from 'firebase/database';
import { AppRegistry } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useState } from 'react';

WebBrowser.maybeCompleteAuthSession();

const auth = getAuth(app);
const database=getDatabase(app);

const googleLogin = async () => {
  try {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // El inicio de sesión con Google fue exitoso
  } catch (error) {
    // Manejar errores de inicio de sesión con Google
    console.error(error);
  }
};

//Estilos par los componentes
const styles=StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,

  },
  titulo:{
    fontSize:25,
    fontWeight:'bold',
    textAlign:'center',
    marginBottom:20,
  },
  cardContainer:{
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,

  },
  card:{
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    marginRight: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,

  },
  image:{
    width:'100%',
    height:160,
    borderRadius:10,
    marginBottom:10,
  },
  name:{
    fontSize:16,
    fontWeight:'bold',
    marginBottom:8,
  },
  price:{
    fontSize:14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: 300,
  },
  modalText:{
    fontSize:18,
    fontWeight:'bold',
    marginBottom:10,
  
  },
  cantidadContainer:{
    flexDirection:'row',
    alignItems:'center',
    marginBottom:10,
  },
  cantidadText:{
    fontSize:16,
    marginRight:10,
  },
  addButton:{
    backgroundColor:'#ccc',
    borderRadius:10,
    padding:5,   
  },
  buttonText:{
    fontSize:16,
    fontWeight:'bold',
    color:'#fff',
  },
  totalText:{
    fontSize:16,
    fontWeight:'bold',
    marginBottom:10,
  },
  comprarProducto:{
    backgroundColor:'green',
    borderRadius:5,
    marginBottom:10,
    padding:10,
  },
  imagenModal:{
    width:250,
    height:200,
    borderRadius:10,
  },
  sliderImage:{
    width:200,
    height:200,
    marginRight:15,
  },
  menuContainer:{
    flexDirection:'row',
    justifyContent:'space-around',
    borderTopWidth:1,
    borderTopColor:'#ccc',
    paddingTop:15,
  },
  menuBoton:{
    alignItems:'center',
  },
  menuIcono:{
    fontSize:25,
  },
  menuTexto:{
    fontSize:12,
  },

});

//Paso 2 - Modificaremos la funcion principal para obtener los datos y ingresarlo de manera dinamica a un cardview
const App = () => {
  const [data, setData] = useState([]);
  const [selectProduct, setSelectProduct] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [total, setTotal] = useState(0);
  const [usuario, setUsuario] = useState('');
  const [imagenes, setImagenes] = useState([]);
  const [token,setToken]=useState('');
  const [userInfo,setUserInfo]=useState(null)
  const [mostrarInfo,setMostrarInfo]=useState(false)

  const[request,response,promptAsync]=Google.useAuthRequest({
    androidClientId:"1058260854658-gabodl6kdkebedc03u5srnqaoig01ejn.apps.googleusercontent.com",
    iosClientId:"1058260854658-gpqqoqa616v7ivl1k8sh7q3ibuj015dv.apps.googleusercontent.com",
    webClientId:"1098904678987-8qbjn8baknpfbd402ssqu0fubrn65sa2.apps.googleusercontent.com"
  })

  useEffect(() => {
    fetchData();
    sliderConexion();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        'https://api.airtable.com/v0/appn54LZmOvHNogBg/Producto',
        {
          headers: {
            Authorization: 'Bearer keyZKCSXHtTz7RkmT',
          },
        }
      );
      setData(response.data.records);
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = (product) => {
    setSelectProduct(product);
    setCantidad(1);
    calculoTotal(product.fields.Precio, 1);
  };

  const closeModal = () => {
    setSelectProduct(null);
  };

  const renderCard = (product) => {
    return (
      <TouchableOpacity key={product.id} style={styles.card} onPress={() => openModal(product)}>
        {/* Renderizado de datos */}
      </TouchableOpacity>
    );
  };

  const Addcantidad = () => {
    const newCantidad = cantidad + 1;
    setCantidad(newCantidad);
    calculoTotal(selectProduct.fields.Precio, newCantidad);
  };

  const RemoveCantidad = () => {
    if (cantidad > 1) {
      const newCantidad = cantidad - 1;
      setCantidad(newCantidad);
      calculoTotal(selectProduct.fields.Precio, newCantidad);
    }
  };

  const calculoTotal = (price, cantidad) => {
    const newTotal = price * cantidad;
    setTotal(newTotal);
  };

  const enviarPedidoAirtable = async (pedido, cantidad, total, usuario) => {
    try {
      const apiKey = 'keyZKCSXHtTz7RkmT';
      const baseId = 'appn54LZmOvHNogBg';
      const tabla = 'Pedidos';
      const url = `https://api.airtable.com/v0/${baseId}/${tabla}`;
      const config = {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      };
      const datos = {
        fields: {
          Pedido: pedido,
          Cantidad: cantidad,
          Total: total,
          Usuario: usuario,
        },
      };
      await axios.post(url, datos, config);
      console.log('Pedido enviado correctamente...');
    } catch (error) {
      console.log('Error al solicitar el pedido', error);
    }
  };

  const confirmarCompra = () => {
    const pedido = selectProduct.fields.Nombre;
    enviarPedidoAirtable(pedido, cantidad, total, usuario);
    closeModal();
  };

  const sliderConexion = async () => {
    try {
      const response = await axios.get(
        'https://api.airtable.com/v0/appn54LZmOvHNogBg/Slider',
        {
          headers: {
            Authorization: 'Bearer keyZKCSXHtTz7RkmT',
          },
        }
      );
      setImagenes(response.data.records);
    } catch (error) {
      console.error(error);
    }
  };
// Funcion Conexion Firebase
const googleLogin=async()=>{
  try{
    const provider=new Google.GoogleAuthProvider();
    const userCredenciales=await Google.signInWithPopup(auth,provider)
    const user=userCredenciales.user;
    console.log("Inicio de sesion con Exito", user.uid);
  }catch(error){
    console.log("error no se pudo iniciar sesion ", error.message);
  }
};
//Funcion conexion token con servicio
const conexionToken=async()=>{
  const user=await getLocalUser();
  if (!user){
    if(response?.type==="success"){
      getUserInfo(response.authentication.accessToken)
    }
  }
}


//Mostrar los datos obtenidos
  
  return (
    <View style={styles.container}>
    <Text style={styles.titulo}>Nombre de la tienda</Text>
    <ScrollView horizontal={true}>
      {imagenes.map((record, index) => (
        <Image
          key={index}
          source={{ uri: record.fields.Url }}
          style={styles.sliderImage}
        />
      ))}
    </ScrollView>

      {data.length> 0? (
        <ScrollView contentContainerStyle={styles.cardContainer} horizontal={true}>
          {data.map((product)=>renderCard(product))}
        </ScrollView>
      ) : (
        <Text>Loading...</Text>
      )}
      <Modal visible={selectProduct !== null} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
        {selectProduct && (
          <View>
             <Text style={styles.modalText}>
              {selectProduct.fields.Nombre}
            </Text>
            <Image source={{uri:selectProduct.fields.Imagen}}
            style={styles.imagenModal}/>
            <Text style={styles.modalText}>
               {selectProduct.fields.Precio} Bs
            </Text>
            <View style={styles.cantidadContainer}>
            <Text styles={styles.cantidadText}>
              Cantidad: 
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={RemoveCantidad}>
              <Text style={styles.cantidadText}>
                -
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={Addcantidad}>
              <Text style={styles.cantidadText}>
                +
              </Text>
            </TouchableOpacity>
            </View>
            <Text style={styles.totalText}>
              Total: {total} Bs
            </Text>
            <View></View>
            <TextInput
            style={styles.text}
            placeholder="Ingrese su nombre"
            value={usuario}
            onChangeText={(text)=>setUsuario(text)}
            />
            <TouchableOpacity style={styles.comprarProducto} onPress={confirmarCompra}>
            <Text style={styles.totalText}>
              Comprar
            </Text>
            </TouchableOpacity>
           
            <TouchableOpacity style={styles.comprarProducto} onPress={closeModal}>
              <Text style={styles.totalText}>
                Cerrar
              </Text>
            </TouchableOpacity>
        </View>
        )}
        
        </View>
      </View>
      </Modal>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuBoton}>
          <AntDesign
          name="home" style={styles.menuIcono}
          />
          <Text style={styles.menuTexto}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBoton}>
          <AntDesign
          name="home" style={styles.menuIcono}
          />
          <Text style={styles.menuTexto}>Productos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBoton}>
          <AntDesign
          name="shoppingcart" style={styles.menuIcono}
          />
          <Text style={styles.menuTexto}>Carrito</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBoton} onPress={googleLogin}>
          <AntDesign
          name="user" style={styles.menuIcono}
          />
          <Text style={styles.menuTexto}>Perfil</Text>
        </TouchableOpacity>
        
      </View>
    </View>
  );
};
AppRegistry.registerComponent('Airtable', () => App);
export default App;

