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
    width: 200,
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
  useEffect(() => {
    fetchData();
  }, []);
  //Paso 1 - Modificacion de la funcion para obtener los datos de la tabla Producto
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
    const apiKey='keyZKCSXHtTz7RkmT';//ReemplAzar por sus apikeys
    const baseId='appn54LZmOvHNogBg';//ReemplAzar por sus baseId
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
        Pedido:selectProduct.fields.Nombre,
        Cantidad: cantidad,
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


//Mostrar los datos obtenidos
  
  return (
    <View style={styles.container}>
    <Text style={styles.titulo}>Nombre de la tienda</Text>
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
            style={styles.image}/>
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
    </View>
  );
};
export default App;
