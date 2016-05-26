<?php
namespace Apps\Core\Php\Entities;

use Apps\Core\Php\DevTools\Authorization\AuthorizationTrait;
use Apps\Core\Php\DevTools\DevToolsTrait;
use Apps\Core\Php\DevTools\Entity\Attributes\FileAttribute;
use Apps\Core\Php\DevTools\Entity\Attributes\FilesAttribute;
use Apps\Core\Php\DevTools\Entity\EntityAbstract;
use Apps\Core\Php\DevTools\Exceptions\AppException;
use Apps\Core\Php\RequestHandlers\ApiException;
use Webiny\Component\Entity\EntityCollection;
use Webiny\Component\Mongo\Index\SingleIndex;

/**
 * Class User
 *
 * @property string           $id
 * @property string           $email
 * @property string           $password
 * @property string           $firstName
 * @property string           $lastName
 * @property EntityCollection $groups
 * @property bool             $enabled
 *
 * @package Apps\Core\Php\Entities
 *
 */
class User extends EntityAbstract
{
    use DevToolsTrait, AuthorizationTrait;

    protected static $entityCollection = 'Users';
    protected static $entityMask = '{email}';

    public function __construct()
    {
        parent::__construct();

        $this->attr('email')->char()->setValidators('required,email,unique')->onSet(function ($email) {
            return trim(strtolower($email));
        })->setValidationMessages([
            'unique' => 'Given e-mail address already exists.'
        ])->setToArrayDefault();

        $this->attr('avatar')->smart(new FileAttribute())->setTags('user', 'avatar');
        $this->attr('gallery')->smart(new FilesAttribute())->setTags('user-gallery');
        $this->attr('gravatar')->dynamic(function () {
            return md5($this->email);
        });
        $this->attr('firstName')->char()->setValidators('required')->setToArrayDefault();
        $this->attr('lastName')->char()->setValidators('required')->setToArrayDefault();
        $this->attr('password')->char()->onSet(function ($password) {
            if (!empty($password) && $this->wValidation()->validate($password, 'password')) {
                return $this->wAuth()->createPasswordHash($password);
            }
        });
        $this->attr('enabled')->boolean()->setDefaultValue(true);
        $userGroup = '\Apps\Core\Php\Entities\UserGroup';
        $this->attr('groups')->many2many('User2Group')->setEntity($userGroup)->setValidators('minLength:1')->onSet(function ($groups) {
            // If not mongo Ids - load groups by tags
            if (is_array($groups)) {
                foreach ($groups as $i => $group) {
                    if (!$this->wDatabase()->isId($group)) {
                        if (is_string($group)) {
                            $groups[$i] = UserGroup::findOne(['tag' => $group]);
                        } elseif (isset($group['id'])) {
                            $groups[$i] = $group['id'];
                        } elseif (isset($group['tag'])) {
                            $groups[$i] = UserGroup::findOne(['tag' => $group['tag']]);
                        }
                    }
                }
            }

            return $groups;
        });

        /**
         * @api.name Login
         * @api.url /login
         * @api.body.username string Username
         * @api.body.password string Password
         * @api.body.rememberme boolean Remember Me
         */
        $this->api('POST', 'login', function () {
            $data = $this->wRequest()->getRequestData();
            $login = $this->wAuth()->processLogin($data['username']);

            if (!$this->wAuth()->getUser()->enabled) {
                throw new AppException('User account is disabled!');
            }

            return [
                'authToken' => $login['authToken'],
                'user'      => $this->wAuth()->getUser()->toArray($this->wRequest()->getFields('*,!password'))
            ];
        })->setBodyValidators(['username' => 'required,email', 'password' => 'required']);

        /**
         * @api.name Get my profile
         * @api.url /me
         * @api.headers.Authorization string Authorization token
         */
        $this->api('GET', 'me', function () {
            $user = $this->wAuth()->getUser();
            if (!$user) {
                throw new ApiException('Invalid token', 'WBY-INVALID-TOKEN');
            }

            return $user->toArray($this->wRequest()->getFields('*,!password'));
        });

        /**
         * @api.name Update my profile
         * @api.url /me
         * @api.headers.Authorization string Authorization token
         */
        $this->api('PATCH', 'me', function () {
            $data = $this->wRequest()->getRequestData();
            $this->wAuth()->getUser()->populate($data)->save();

            $user = $this->wAuth()->getUser();
            if (!$user) {
                throw new ApiException('Invalid token', 'WBY-INVALID-TOKEN');
            }

            return $user->toArray($this->wRequest()->getFields('*,!password'));
        });
    }


    protected static function entityIndexes()
    {
        return [
            new SingleIndex('email', 'email', false, true)
        ];
    }

    /**
     * Get user instance for authorization
     * @return $this
     */
    protected function getUserToAuthorize()
    {
        return $this;
    }

    protected function getUserGroups()
    {
        return $this->groups;
    }

    public function save()
    {
        $new = !$this->exists();
        $res = parent::save();
        if ($new) {
            $this->wAuth()->getLogin()->setUserAccountConfirmationStatus($this->email);
        }

        return $res;
    }
}