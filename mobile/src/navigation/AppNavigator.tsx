import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable } from 'react-native';

import { Loading } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import AccountScreen from '../screens/AccountScreen';
import AdminPostsScreen from '../screens/AdminPostsScreen';
import LoginScreen from '../screens/LoginScreen';
import PeopleListScreen from '../screens/PeopleListScreen';
import PersonFormScreen from '../screens/PersonFormScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import PostFormScreen from '../screens/PostFormScreen';
import PostListScreen from '../screens/PostListScreen';
import { colors } from '../theme';
import { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background },
};

const headerStyle = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '700' as const },
};

/** As abas navegam para telas da stack raiz (formulários); tipamos o `navigation` das abas dessa forma. */
const root = (navigation: unknown) => navigation as NativeStackNavigationProp<RootStackParamList>;

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IconName, focusedName: IconName) {
  return ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
    <Ionicons name={focused ? focusedName : name} size={size} color={color} />
  );
}

function HeaderAdd({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ marginRight: 16 }}
      hitSlop={8}
    >
      <Ionicons name="add-circle" size={30} color={colors.white} />
    </Pressable>
  );
}

/**
 * Abas principais. Apenas professores enxergam as abas administrativas;
 * alunos e visitantes têm somente leitura de posts.
 */
function Tabs() {
  const { isTeacher } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        ...headerStyle,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Posts"
        component={PostListScreen}
        options={({ navigation }) => ({
          title: 'Blog FIAP',
          tabBarLabel: 'Posts',
          tabBarIcon: tabIcon('newspaper-outline', 'newspaper'),
          headerRight: isTeacher
            ? () => <HeaderAdd label="Novo post" onPress={() => root(navigation).navigate('PostForm')} />
            : undefined,
        })}
      />

      {isTeacher && (
        <>
          <Tab.Screen
            name="Admin"
            component={AdminPostsScreen}
            options={({ navigation }) => ({
              title: 'Administração de posts',
              tabBarLabel: 'Admin',
              tabBarIcon: tabIcon('settings-outline', 'settings'),
              headerRight: () => (
                <HeaderAdd label="Novo post" onPress={() => root(navigation).navigate('PostForm')} />
              ),
            })}
          />
          <Tab.Screen
            name="Teachers"
            component={PeopleListScreen}
            options={({ navigation }) => ({
              title: 'Professores',
              tabBarIcon: tabIcon('school-outline', 'school'),
              headerRight: () => (
                <HeaderAdd
                  label="Novo professor"
                  onPress={() => root(navigation).navigate('PersonForm', { kind: 'teachers' })}
                />
              ),
            })}
          />
          <Tab.Screen
            name="Students"
            component={PeopleListScreen}
            options={({ navigation }) => ({
              title: 'Alunos',
              tabBarIcon: tabIcon('people-outline', 'people'),
              headerRight: () => (
                <HeaderAdd
                  label="Novo aluno"
                  onPress={() => root(navigation).navigate('PersonForm', { kind: 'students' })}
                />
              ),
            })}
          />
        </>
      )}

      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: 'Minha conta',
          tabBarLabel: 'Conta',
          tabBarIcon: tabIcon('person-circle-outline', 'person-circle'),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { loading, isAuthenticated, isGuest, isTeacher } = useAuth();

  if (loading) return <Loading message="Restaurando sessão…" />;

  const canEnter = isAuthenticated || isGuest;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={headerStyle}>
        {!canEnter ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Post' }} />
            {/* Rotas de escrita só existem para professores autenticados */}
            {isTeacher && (
              <>
                <Stack.Screen name="PostForm" component={PostFormScreen} options={{ title: 'Post' }} />
                <Stack.Screen name="PersonForm" component={PersonFormScreen} options={{ title: 'Cadastro' }} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
