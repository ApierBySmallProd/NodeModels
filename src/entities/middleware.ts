import EntityManager from './entitymanager';

export const withContext = (
  controller: (req: any, res: any, next?: any) => any,
) => {
  return async (req: any, res: any, next: any) => {
    const context = EntityManager.createContext();
    res.locals.modelContext = context;
    await controller(req, res, next);
    EntityManager.closeContext(context);
  };
};
