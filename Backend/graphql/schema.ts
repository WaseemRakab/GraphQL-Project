import {gql} from 'apollo-server-express';
import * as fs from 'fs';
import * as path from 'path';
import {rootDir} from '../util/rootDir';

const userSchemaString = fs.readFileSync(path.join(rootDir(), 'graphql', 'userSchema.graphql')).toString();
const postsSchemaString = fs.readFileSync(path.join(rootDir(), 'graphql', 'postSchema.graphql')).toString();

export const typeDefs = [gql`${userSchemaString}`, gql`${postsSchemaString}`];

