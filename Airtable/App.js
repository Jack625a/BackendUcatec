//IMPORTAR LOS ARCHIVOS
import React, { useEffect, useState } from 'react';
//Modal para la pantalla emergente, textinput para la entrada de datos, touchable para nuestros botones
import { View, Text, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity,Modal} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AntDesign} from '@expo/vector-icons';//Iconos


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
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    marginRight: 10,
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
    height:200,
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
  modalDatos: {
  },
  modalText:{
    fontSize:20,
    fontWeight:'bold',
    marginBottom:10,
  
  },
 text:{
    fontSize:20,
    
  
  },
  cantidadContainer:{
    flexDirection:'row',
    alignItems:'center',
    marginBottom:10,
  },
  cantidadText:{
    fontSize:22,
    marginRight:10,
  },
  addButton:{
    backgroundColor:'#ccc',
    borderRadius:10,
    padding:7,
    margin:2   
  },
  buttonText:{
    fontSize:30,
    fontWeight:'bold',
    color:'#fff',
  },
  totalText:{
    fontSize:17,
    fontWeight:'bold',
    marginBottom:5,
    color:'#fff'
  },
  comprarProducto:{
    backgroundColor:'#F57D31',
    borderRadius:5,
    marginBottom:10,
    padding:5,
    alignItems:'center'
  },
  imagenModal:{
    width:250,
    height:200,
    borderRadius:10,
  },
  sliderImage:{
    width:250,
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
  row1: {
 
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacing:{
      padding:10,
},


});

//Paso 2 - Modificaremos la funcion principal para obtener los datos y ingresarlo de manera dinamica a un cardview
const App = () => {
  const [data, setData] = useState([]);
  //Seleccione de nuestros productos
  const [selectProduct,setSelectProduct]=useState(null);
  //Cantidad del producto que desea comprar
  const [cantidad, setcantidad]=useState(1)
  //Total a pagar
  const [total, setTotal]=useState(0)
  //Nombre del usuario
   const [usuario, setUsuario]=useState("")
  //Slider
  const [imagenes,setimagenes]=useState([]);
  useEffect(() => {
    fetchData();
  }, []);
  //Paso 1 - Modificacion de la funcion para obtener los datos de la tabla Producto
  const fetchData = async () => {
    try {
      const response = await axios.get(
        'https://api.airtable.com/v0/app1HBnXAc5WFFNPV/Producto',
        {
          headers: {
            Authorization: 'Bearer key2eB5JizNlD6i2B',
          },
        }
      );
      setData(response.data.records);
    } catch (error) {
      console.error(error);
    }
  };
//Funciones nuevas
//Funcion para abrir la pantalla Emergente
const openModal=(product)=>{
  setSelectProduct(product);
  setcantidad(1);
  calculoTotal(product.fields.Precio,1);
};
//Funcion para cerrar la pantalla Emergente
const closeModal=()=>{
  setSelectProduct(null);
}; 

//Funcion para manejar los datos y renderizar
const renderCard=(product)=>{
  return (
    <TouchableOpacity key={product.id} style={styles.card} onPress={() => openModal(product)}>
      <Image source={{uri:product.fields.Imagen}}
      style={styles.image}
      />
      <Text
       style={styles.name}
       >
        {product.fields.Nombre}
      </Text>
      <Text style={styles.price}>
      {product.fields.Precio} Bs

      </Text>
    </TouchableOpacity>
  );
};
//funcion para controlar el aumento de la cantidad
const Addcantidad=()=>{
  const newcantidad=cantidad+1;
  setcantidad(newcantidad);
  calculoTotal(selectProduct.fields.Precio,newcantidad)
}
//funcion para controlar el decremento de la cantidad
const RemoveCantidad=()=>{
  if (cantidad>1){
    const newcantidad=cantidad-1;
    setcantidad(newcantidad)
    calculoTotal(selectProduct.fields.Precio,newcantidad)
  }
};

//Funcion para calcular el total que debera pagar el usuario
const calculoTotal=(price,cantidad)=>{
  const newTotal=price*cantidad;
  setTotal(newTotal);
}
//Funcion para enviar el pedido a Airtable
const enviarPedidoAirtable= async (pedido,cantidad,total,usuario) => {
  try{
    const apiKey='key2eB5JizNlD6i2B';//ReemplAzar por sus apikeys
    const baseId='app1HBnXAc5WFFNPV';//ReemplAzar por sus baseId
    const tabla='Pedidos';
    const url=`https://api.airtable.com/v0/${baseId}/${tabla}`;
    const config={
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    };
    const datos={
      fields:{
        Cantidad: cantidad,
        Pedido:selectProduct.fields.Nombre,
        Total:total,
        Usuario:usuario,
      },
    };
    await axios.post(url,datos,config);
    console.log("Pedido enviado correctamente...");
  }catch(error){
    console.log("Error al solicitar el pedido",error);
  }
};
//Funcion para confirmar la compra
const confirmarCompra=()=>{
  const{ Pedido }=selectProduct.fields.Nombre;
  enviarPedidoAirtable(Pedido,cantidad,total,usuario);
  closeModal();
}
//funcion para añadir el slider
const sliderConexion=async()=>{
  try {
    const response = await axios.get(
      'https://api.airtable.com/v0/app1HBnXAc5WFFNPV/Slider',
      
      {
        headers: {
          Authorization: 'Bearer key2eB5JizNlD6i2B',
        },
      }

    );
    const sliderImagenes=response.data.records.map(
      (record)=>record.fields.Url
    );
      setimagenes(sliderImagenes);
  }catch(error){
    console.error(error);
  }
}
//funcion para la autenticacion con google-firebase
const googleLogin=async()=>{
  try{
    const provider=new GoogleAuthProvider();
    const auth=getAuth();
    const userCredenciales=await signInWithPopup(auth,provider);
    const user=userCredenciales.user;
    console.log('Inicio de seion con Google exitoso',user.uid);
  }catch(error){
    console.log('Error al inicar sesion',error);

  }
 }
//Mostrar los datos obtenidos
  
  return (
    <View style={styles.container}>
    <Text style={styles.titulo}>Nombre de la tienda</Text>
    <ScrollView horizontal={true}>
        {imagenes.map((Url,index)=>(
          <Image key={index} source={{uri:Url}} style={styles.sliderImage}/>
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
          <View style={styles.modalDatos}>
           
            <Image source={{uri:selectProduct.fields.Imagen}}
           style={styles.imagenModal} />

            {/* name */}
        <View style={styles.row1}>
             <Text style={styles.modalText}>
              {selectProduct.fields.Nombre}
            </Text>
        </View>
 {/* price */}
        <View style={styles.row1}>
            <Text style={styles.modalText}>Precio: {selectProduct.fields.Precio} Bs.
            </Text>
            
        </View>
        <View style={styles.spacing}></View>
            <View style={styles.cantidadContainer}>
            <View style={styles.cantidadContainer}>
            <Text style={styles.modalText}>
             Cantidad:
            </Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={RemoveCantidad}>
              <Text style={styles.buttonText}>
                -
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={Addcantidad}>
              <Text style={styles.buttonText}>
                +
              </Text>
            </TouchableOpacity>
            </View>
            <View style={styles.cantidadContainer}>
            <Text style={styles.modalText}>
              Total: {total} Bs
            </Text>
            </View>

            <View></View>
            <TextInput
            style={styles.text}
            placeholder="Ingrese su nombre"
            value={usuario}
            onChangeText={(text)=>setUsuario(text)}
            />
             <View style={styles.spacing}></View>
            <TouchableOpacity style={styles.comprarProducto} onPress={confirmarCompra}>
            <Text style={styles.totalText}>
              COMPRAR
            </Text>
            </TouchableOpacity>
           
            <TouchableOpacity style={styles.comprarProducto} onPress={closeModal}>
              <Text style={styles.totalText}>
                CERRAR
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
    name='home' style={styles.menuIcono}
    />
<Text style={styles.menuTexto}>Productos</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.menuBoton}>
    <AntDesign
    name='home' style={styles.menuIcono}
    />
<Text style={styles.menuTexto}>Inicio</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.menuBoton} >
    <AntDesign
    name='user' style={styles.menuIcono}
    />
<Text style={styles.menuTexto}>Perfil</Text>
  </TouchableOpacity>


</View>
    </View>
  );
};
export default App;