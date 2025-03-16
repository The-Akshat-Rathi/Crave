import {View, Text} from 'react-native'
import React from 'react'
import {useLocalSearchParams} from "expo-router";

const properties = () => {
    const { id } = useLocalSearchParams();
    return (
        <View>
            <Text>properties{ id }</Text>
        </View>
    )
}
export default properties
